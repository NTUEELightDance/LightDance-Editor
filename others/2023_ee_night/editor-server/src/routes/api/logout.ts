import type { Request, Response } from "express";

import redis from "../../redis";

const logout = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(400).send({ err: "Token is required." });
    return;
  }

  const id = await redis.get(token);
  if (id) {
    await redis.del(id);
    await redis.del(token);
    res.status(200).send({ success: true });
  } else {
    res.status(401).send({ err: "Unauthorized." });
  }
};

export default logout;
