import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const PartSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  controlData: [{ type: mongoose.Types.ObjectId, ref: "Control" }],
});

// Creating a table within database with the defined schema
const Part = mongoose.model("Part", PartSchema);

// Exporting table for querying and mutating

export default Part;
