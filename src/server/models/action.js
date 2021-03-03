const mongoose = require("mongoose");

const { Schema } = mongoose;

// Creating a schema, sort of like working with an ORM
const ActionSchema = new Schema({
  time: { type: Date, default: Date.now },
  from: {
    type: String,
    required: [true, "From field is required."],
  },
  type: {
    type: String,
    required: [true, "Type field is required."],
  },
  mode: {
    type: String,
    required: [true, "Mode field is required."],
  },
  data: {
    type: String,
    required: [true, "Data field is required."],
  },
});

// Creating a table within database with the defined schema
const Action = mongoose.model("action", ActionSchema);

// Exporting table for querying and mutating

module.exports = { ActionSchema, Action };
