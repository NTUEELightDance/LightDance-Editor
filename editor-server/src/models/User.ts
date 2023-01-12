import mongoose from "mongoose";
import { IUser } from "../types/global";

const Schema = mongoose.Schema;
const userSchema = new Schema<IUser>({
  userID: {
    type: String,
    required: [true, "userID field is required."],
    // unique: true
  },
  name: {
    type: String,
    required: [true, "Name field is required."],
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
