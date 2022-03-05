import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const LoggerSchema = new Schema({
  user: {
    type: String,
    required: [true, "User field is required"],
  },
  variableValues: { type: Object, default: {} },
  type: {
    type: String,
    required: [true, "Type field is required"],
  },
  fieldName: {
    type: String,
    require: [true, "Field name is required"],
  },
  time: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    require: [true, "Status field is required"],
  },
  errorMessage: {
    type: {},
    require: false,
  },
  result: {
    type: {},
    require: false,
  },
});

// Creating a table within database with the defined schema
const Logger = mongoose.model("Logger", LoggerSchema);

// Exporting table for querying and mutating

export default Logger;
