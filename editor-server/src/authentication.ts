import { v4 as uuidv4 } from "uuid";
import redis from "./redis";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

interface CheckTokenSuccess {
  success: true;
  user: User;
}

interface CheckTokenFailure {
  success: false;
  user: null;
}

export type CheckTokenResult = Promise<CheckTokenSuccess | CheckTokenFailure>;

export const verifyToken = async (
  token: string | undefined
): CheckTokenResult => {
  if (!token) {
    return { success: false, user: null };
  }
  const id = await redis.get(token);
  if (!id) {
    return { success: false, user: null };
  }
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!user) {
    return { success: false, user: null };
  }
  return { success: true, user };
};

export const verifyAdminToken = async (
  token: string | undefined
): CheckTokenResult => {
  const result = await verifyToken(token);
  if (!result.success) {
    return result;
  }

  if (result.user.name !== process.env.ADMIN_USERNAME) {
    return { success: false, user: null };
  }

  return result;
};

// generate a csrf token for user
export const generateCsrfToken = () => uuidv4();

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
