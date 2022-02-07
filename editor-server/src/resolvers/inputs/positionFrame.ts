import { InputType, Field } from "type-graphql";

@InputType()
export class EditPositionFrameInput {
  @Field()
  frameID: string;

  @Field()
  start: number;
}

@InputType()
export class DeletePositionFrameInput {
  @Field()
  frameID: string;
}
