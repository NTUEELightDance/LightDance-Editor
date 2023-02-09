import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;

export const createUser = async (
  username: string,
  password: string
): Promise<void> => {
  const hash = await bcrypt.hash(password, HASH_ROUNDS);
  await prisma.user.create({
    data: {
      name: username,
      password: hash,
      editingControlFrameId: {
        create: {
          frameId: null,
        },
      },
      editingPositionFrameId: {
        create: {
          frameId: null,
        },
      },
    },
  });
};

export const initUsers = async () => {
  console.log("init users");
  await prisma.user.deleteMany();
  await createUser("admin", "admin");
};

initUsers();

export default prisma;
