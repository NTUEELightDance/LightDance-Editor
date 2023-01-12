import mongoose from "mongoose";
import { IDancer } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const DancerSchema = new Schema<IDancer>({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  parts: [{ type: mongoose.Types.ObjectId, ref: "Part" }],
  positionData: [{ type: mongoose.Types.ObjectId, ref: "Position" }],
  id: { type: String, required: [true, "id is needed"] },
});

// Creating a table within database with the defined schema
const Dancer = mongoose.model<IDancer>("Dancer", DancerSchema);

// Exporting table for querying and mutating

export default Dancer;
