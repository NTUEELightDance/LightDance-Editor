
import { InputType, Field } from "type-graphql";

@InputType()
export class EditPositionFrameInput {
  @Field()
    frameID: number;

  @Field()
    start: number;
}

@InputType()
export class DeletePositionFrameInput {
  @Field()
    frameID: number;
}
