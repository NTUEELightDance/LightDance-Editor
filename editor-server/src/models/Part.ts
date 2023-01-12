import mongoose from "mongoose";
import { IPart } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const PartSchema = new Schema<IPart>({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  type: {
    type: String,
    required: [true, "type field is required."],
  },
  controlData: [{ type: mongoose.Types.ObjectId, ref: "Control" }],
  id: { type: String, required: [true, "id is needed"] },
});

// Creating a table within database with the defined schema
const Part = mongoose.model<IPart>("Part", PartSchema);

// Exporting table for querying and mutating

export default Part;
