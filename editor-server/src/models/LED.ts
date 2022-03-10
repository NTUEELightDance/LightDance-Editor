import mongoose from "mongoose";

const Schema = mongoose.Schema;
const LEDSchema = new Schema({
  partName: {
    type: String,
    required: [true, "partName field is required."],
  },
  effectName: {
    type: String,
    default: "",
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

const LED = mongoose.model("LED", LEDSchema);
export default LED;
