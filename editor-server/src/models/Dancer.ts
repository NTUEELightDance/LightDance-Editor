import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const DancerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  parts: [{ type: mongoose.Types.ObjectId, ref: "Part" }],
  positionData: [{ type: mongoose.Types.ObjectId, ref: "Position" }],
});

// Creating a table within database with the defined schema
const Dancer = mongoose.model("Dancer", DancerSchema);

// Exporting table for querying and mutating

export default Dancer;
