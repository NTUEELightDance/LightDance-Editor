import mongoose from "mongoose";
import { ILED } from "../types/global";

const Schema = mongoose.Schema;
const LEDSchema = new Schema<ILED>({
  partName: {
    type: String,
    required: [true, "partName field is required."],
  },
  effectName: {
    type: String,
    required: [true, "effectName field is required."],
  },
  repeat: {
    type: Number,
    required: [true, "repeat field is required"],
  },
  effects: [
    {
      start: {
        type: Number,
        required: [true, "start in effects is required"],
      },
      fade: {
        type: Boolean,
        required: [true, "fade in effects is required"],
      },
      effect: [
        {
          colorCode: {
            type: String,
            required: [true, "colorCode in effects is required"],
          },
          alpha: {
            type: Number,
            required: [true, "alpha in effects is required"],
          },
        },
      ],
    },
  ],
});

const LED = mongoose.model<ILED>("LED", LEDSchema);
export default LED;
