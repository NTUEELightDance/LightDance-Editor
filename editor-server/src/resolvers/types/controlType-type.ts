import { registerEnumType } from "type-graphql";

export enum ControlType {
    FIBER = "FIBER",
    EL = "EL",
    LED = "LED"
}

registerEnumType(ControlType, {
    name: "ControlType", // this one is mandatory
    description: "The basic control types", // this one is optional
});