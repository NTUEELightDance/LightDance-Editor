import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const ControlFrameSchema = new Schema({
  fade: { type: Boolean, required: [true, "fade field is required."] },
  start: { type: Number, required: [true, "start field is required."] },
});

// Creating a table within database with the defined schema
const ControlFrame = mongoose.model("ControlFrame", ControlFrameSchema);

// Exporting table for querying and mutating

export default ControlFrame;
