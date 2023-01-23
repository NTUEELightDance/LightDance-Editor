import mongoose from "mongoose";
import { IUser } from "../types/global";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const hash = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

const compare = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

const Schema = mongoose.Schema;
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.methods.generateToken = () => uuidv4();
userSchema.methods.comparePassword = function (password: string) {
  return compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export const createUser = async (username: string, password: string) => {
  const user = new User({
    username,
    password: await hash(password),
  });
  return await user.save();
};

export default User;
