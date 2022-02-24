import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const EffectListSchema = new Schema({
  start: { type: Number, required: [true, "start field is required."] },
  end: { type: Number, required: [true, "start field is required."] },
  description: { type: String, required: false },
  controlFrames: { type: Object },
  positionFrames: { type: Object },
});

// Creating a table within database with the defined schema
const EffectList = mongoose.model("EffectList", EffectListSchema);

// Exporting table for querying and mutating

export default EffectList;
