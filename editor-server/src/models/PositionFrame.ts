import mongoose from "mongoose";
import { IPositionFrame } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const PositionFrameSchema = new Schema<IPositionFrame>({
  start: { type: Number, required: [true, "start field is required."] },
  editing: { type: String },
  id: { type: String, required: [true, "id is needed"] },
});

// Creating a table within database with the defined schema
const PositionFrame = mongoose.model<IPositionFrame>(
  "PositionFrame",
  PositionFrameSchema
);

// Exporting table for querying and mutating

export default PositionFrame;
