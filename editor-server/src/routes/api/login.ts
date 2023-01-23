import type { Request, Response } from "express";

import db from "../../models";
import redis from "../../redis";

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send({ err: "Username and password are required." });
    return;
  }

  const user = await db.User.findOne({ username });
  if (user) {
    if (await user.comparePassword(password)) {
      // remove old token
      const oldToken = await redis.get(user._id.toString());
      if (oldToken) {
        await redis.del(oldToken);
      }

      // store new token
      const token = user.generateToken();
      await redis.set(token, user._id.toString());
      await redis.set(user._id.toString(), token);
      await redis.expire(token, 60 * 60 * 24 * 7);
      await redis.expire(user._id.toString(), 60 * 60 * 24 * 7);

      // send token to client
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
      });
      res.status(200).send({ token });
    } else {
      res.status(401).send({ err: "Password is incorrect." });
    }
  } else {
    res.status(404).send({ err: "User not found." });
  }
};

export default login;
