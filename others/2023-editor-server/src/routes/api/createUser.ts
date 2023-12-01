import type { Request, Response } from "express";

import { createUser } from "../../prisma";
import { verifyAdminToken } from "../../authentication";

const createUserRoute = async (req: Request, res: Response) => {
  const { token } = req.cookies;
  const { success: isAdmin } = await verifyAdminToken(token);
  if (!isAdmin) {
    res.status(401).send({ err: "Unauthorized." });
    return;
  }

  const { username, password } = req.body;
  try {
    await createUser(username, password);
    res.status(200).send(`Successfully created user "${username}"`);
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default createUserRoute;
