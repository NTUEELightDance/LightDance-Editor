import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const PositionFrameSchema = new Schema({
  start: { type: Number, required: [true, "start field is required."] },
  editing: { type: String },
  id: { type: String, required: [true, "id is needed"] }

});

// Creating a table within database with the defined schema
const PositionFrame = mongoose.model("PositionFrame", PositionFrameSchema);

// Exporting table for querying and mutating

export default PositionFrame;
