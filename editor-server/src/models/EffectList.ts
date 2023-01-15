import mongoose from "mongoose";
import { IEffectList } from "../types/global";

const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const EffectListSchema = new Schema<IEffectList>(
  {
    start: { type: Number, required: [true, "start field is required."] },
    end: { type: Number, required: [true, "start field is required."] },
    description: { type: String, required: false },
    controlFrames: { type: Object, default: {} },
    positionFrames: { type: Object, default: {} },
  },
  { minimize: false }
);

// Creating a table within database with the defined schema
const EffectList = mongoose.model<IEffectList>("EffectList", EffectListSchema);

// Exporting table for querying and mutating

export default EffectList;
