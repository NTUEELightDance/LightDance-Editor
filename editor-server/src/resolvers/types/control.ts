import { Field, ObjectType } from "type-graphql";

import { ControlFrame } from "./controlFrame";
import { ControlDevice } from "./controlDevice";
import { IControlValue } from "../../types/global";

@ObjectType()
export class Control {
  @Field((type) => ControlFrame)
  frame: ControlFrame;

  @Field((type) => ControlDevice)
  status: IControlValue;

  value: IControlValue;
}
