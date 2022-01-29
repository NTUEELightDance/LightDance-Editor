import { Field, ObjectType, Int, Float } from "type-graphql";
import { ControlFrame } from "./controlFrame";
import { ControlDevice } from "./controlDevice";

@ObjectType()
export class Control {
  @Field((type) => ControlFrame)
  frame: ControlFrame;

  @Field((type) => ControlDevice)
  status: any;
}
