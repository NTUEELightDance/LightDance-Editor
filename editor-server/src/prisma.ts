import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;

export const createUser = async (
  username: string,
  password: string
): Promise<void> => {
  // throw an error if the username or password is empty
  if (username.length === 0 || password.length === 0) {
    throw new Error("Username and password are required.");
  }

  // throw an error if the username contains a space
  if (username.includes(" ")) {
    throw new Error("Username cannot contain spaces.");
  }

  // throw an error if the username is too long
  if (username.length > 30) {
    throw new Error("Username cannot be longer than 30 characters.");
  }

  // throw an error if the password is too long
  if (password.length > 100) {
    throw new Error("Password cannot be longer than 100 characters.");
  }

  // throw an error if try to create a user with the same name as the admin and it already exists
  if (username === process.env.ADMIN_USERNAME) {
    const admin = await prisma.user.findUnique({
      where: {
        name: username,
      },
    });
    if (admin) {
      throw new Error("Admin user already exists.");
    }
  }

  // if the user already exists, update the password
  const user = await prisma.user.findUnique({
    where: {
      name: username,
    },
  });
  if (user) {
    const hash = await bcrypt.hash(password, HASH_ROUNDS);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hash,
      },
    });
    return;
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
