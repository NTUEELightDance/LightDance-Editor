import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const ControlSchema = new Schema({
  frame: {
    type: mongoose.Types.ObjectId,
    ref: "ControlFrame",
  },
  type: {
    type: String,
    required: [true, "type field is required."],
  },
  value: { type: Object, required: [true, "value field is required."] },
});

// Creating a table within database with the defined schema
const Control = mongoose.model("Control", ControlSchema);

// Exporting table for querying and mutating

export default Control;
