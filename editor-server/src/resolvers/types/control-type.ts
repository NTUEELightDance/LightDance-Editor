import { Field, ObjectType, Int, Float } from "type-graphql";
import { ControlType } from "./controlType-type";
import { ControlFrame } from "./controlFrame-type";
import { ControlDevice } from "./controlDevice-type";

@ObjectType()
export class Control {
    @Field(type => ControlFrame)
    frame: ControlFrame

    @Field(type => ControlType)
    type: ControlType

    @Field(type => ControlDevice)
    status: any
}
