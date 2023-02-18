import { InputType, Field, Int } from "type-graphql";

@InputType()
export class EditPositionFrameInput {
  @Field((type) => Int)
  frameID: number;

  @Field((type) => Int)
  start: number;
}

@InputType()
export class DeletePositionFrameInput {
  @Field((type) => Int)
  frameID: number;
}
