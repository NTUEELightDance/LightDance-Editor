const mongoose = require("mongoose");

const { Schema } = mongoose;

// Creating a schema, sort of like working with an ORM
const PosFrameSchema = new Schema({
  start: { type: Number, required: [true, "start field is required."] },
  pos: { type: String, required: [true, "pos field is required."] },
});

// Creating a table within database with the defined schema
const PosFrame = mongoose.model("posFrame", PosFrameSchema);

// Exporting table for querying and mutating

module.exports = { PosFrameSchema, PosFrame };
