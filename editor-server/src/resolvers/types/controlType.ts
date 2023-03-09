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
    color: -1,
    alpha: 0,
  },
  LED: {
    src: -1,
    alpha: 0,
  },
};
