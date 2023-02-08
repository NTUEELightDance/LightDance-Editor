import type { Request, Response } from "express";

import redis from "../../redis";
import prisma from "../../prisma";
import { generateCsrfToken, comparePassword } from "../../authentication";

const login = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "development") {
    res.send({ token: "testToken" });
    return;
  }

  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).send({ err: "Username and password are required." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      name: username,
    },
  });

  if (user) {
    if (await comparePassword(password, user.password)) {
      // remove old token
      const oldToken = await redis.get(user.id.toString());
      if (oldToken) {
        await redis.del(oldToken);
      }

      const expirationTimeSeconds =
        60 * 60 * parseInt(process.env.EXPIRATION_TIME_HOURS ?? "24", 10);

      // store new token
      const token = generateCsrfToken();
      await redis.set(token, user.id.toString());
      await redis.set(user.id.toString(), token);
      await redis.expire(token, expirationTimeSeconds);
      await redis.expire(user.id.toString(), expirationTimeSeconds);

      // send token to client
      res.cookie("token", token, {
        maxAge: 1000 * expirationTimeSeconds,
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
