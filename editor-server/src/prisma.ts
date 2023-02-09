import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;

export const createUser = async (
  username: string,
  password: string
): Promise<void> => {
  // if the user already exists, throw an error
  const user = await prisma.user.findUnique({
    where: {
      name: username,
    },
  });
  if (user) {
    throw new Error(`User "${username}" already exists.`);
  }

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

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

const createAdmin = async () => {
  // delete the admin user if it exists
  await prisma.user.deleteMany({
    where: {
      name: ADMIN_USERNAME,
    },
  });
  await createUser(ADMIN_USERNAME, ADMIN_PASSWORD);
  console.log("Successfully created admin user.");
};

createAdmin();

export default prisma;
