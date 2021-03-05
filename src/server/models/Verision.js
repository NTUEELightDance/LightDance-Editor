const mongoose = require("mongoose");

const { ControlFrameSchema } = require("./ControlFrame");
const { PosFrameSchema } = require("./PosFrame");

const { Schema } = mongoose;

// Creating a schema, sort of like working with an ORM
const BranchSchema = new Schema({
  time: { type: Date, default: Date.now },
  name: {
    type: String,
    required: [true, "Name field is required."],
  },
  controlRecord: {
    type: [ControlFrameSchema],
    default: [],
  },
  posRecord: {
    type: [PosFrameSchema],
    default: [],
  },
});

// Creating a table within database with the defined schema
const Branch = mongoose.model("branch", BranchSchema);

// Exporting table for querying and mutating
module.exports = Branch;
