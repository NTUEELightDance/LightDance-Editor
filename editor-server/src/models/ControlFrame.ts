import mongoose from "mongoose";
import { IControlFrame } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const ControlFrameSchema = new Schema<IControlFrame>({
  fade: { type: Boolean, required: [true, "fade field is required."] },
  start: { type: Number, required: [true, "start field is required."] },
  editing: { type: String },
  id: { type: String, required: [true, "id is needed"] },
});

// Creating a table within database with the defined schema
const ControlFrame = mongoose.model<IControlFrame>(
  "ControlFrame",
  ControlFrameSchema
);

// Exporting table for querying and mutating

export default ControlFrame;
