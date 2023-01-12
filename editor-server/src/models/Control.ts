import mongoose from "mongoose";
import { IControl } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const ControlSchema = new Schema<IControl>({
  frame: {
    type: mongoose.Types.ObjectId,
    ref: "ControlFrame",
  },
  value: { type: Object, required: [true, "value field is required."] },
});

// Creating a table within database with the defined schema
const Control = mongoose.model<IControl>("Control", ControlSchema);

// Exporting table for querying and mutating

export default Control;
