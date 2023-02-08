import type { Request, Response } from "express";

import redis from "../../redis";
import prisma from "../../prisma";

const checkToken = async (req: Request, res: Response) => {
  // check if cookie exists
  const { token } = req.cookies;
  console.log("checkToken", token);

  if (token) {
    // check if sessionid is valid
    const id = parseInt((await redis.get(token)) ?? "0");
    if (id) {
      // send back user data
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        res.send({ token });
      } else {
        res.status(404).send({ err: "User not found." });
      }
    }
  } else {
    res.status(401).send({ err: "Unauthorized." });
  }
};

export default checkToken;
