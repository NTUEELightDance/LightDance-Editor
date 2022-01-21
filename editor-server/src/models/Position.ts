import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const PositionSchema = new Schema({
  frame: {
    type: mongoose.Types.ObjectId,
    ref: "PositionFrame",
    required: [true, "position frame field is required."],
  },
  x: Number,
  y: Number,
  z: Number,
});

// Creating a table within database with the defined schema
const Position = mongoose.model("Position", PositionSchema);

// Exporting table for querying and mutating

export default Position;
