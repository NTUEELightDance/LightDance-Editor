import mongoose from "mongoose";
import { IColor } from "../types/global";

const Schema = mongoose.Schema;
const ColorSchema = new Schema<IColor>({
  color: {
    type: String,
    required: [true, "color field is required."],
  },
  colorCode: {
    type: String,
    required: [true, "color code field is required."],
  },
});

const Color = mongoose.model<IColor>("Color", ColorSchema);
export default Color;
