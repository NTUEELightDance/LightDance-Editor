import { registerEnumType } from "type-graphql";

export enum ControlType {
  FIBER = "FIBER",
  LED = "LED",
}

registerEnumType(ControlType, {
  name: "ControlType", // this one is mandatory
  description: "The basic control types", // this one is optional
});

export const ControlDefault = {
  FIBER: {
    color: "black",
    alpha: 0,
  },
  LED: {
    src: "",
    alpha: 0,
  },
};
