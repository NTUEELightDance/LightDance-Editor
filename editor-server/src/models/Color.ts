import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ColorSchema = new Schema({
  color: {
    type: String,
    required: [true, "color field is required."],
  },
  colorCode: {
    type: String,
    required: [true, "color code field is required."],
  },
  id: { type: String, required: [true, "id is needed"] },
});

const Color = mongoose.model("Color", ColorSchema);
export default Color;
