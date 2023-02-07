import type { Request, Response } from "express";

// import redis from "../../redis";

// TODO: implement this
const checkToken = async (req: Request, res: Response) => {
  res.send({ token: "token" });
  // check if cookie exists
  // const { token } = req.cookies;
  // console.log("checkToken", token);
  // if (token) {
  //   // check if sessionid is valid
  //   const id = await redis.get(token);
  //   if (id) {
  //     // send back user data
  //     const user = await db.User.findById(id);
  //     if (user) {
  //       res.send({ token });
  //     } else {
  //       res.status(404).send({ err: "User not found." });
  //     }
  //   }
  // } else {
  //   res.status(401).send({ err: "Unauthorized." });
  // }
};

export default checkToken;
