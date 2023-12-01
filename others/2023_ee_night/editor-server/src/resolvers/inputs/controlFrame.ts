import { InputType, Field, Int } from "type-graphql";

@InputType()
export class EditControlFrameInput {
  @Field((type) => Int)
  frameID: number;

  @Field((type) => Int, { nullable: true })
  start?: number;

  @Field({ nullable: true })
  fade?: boolean;
}

@InputType()
export class DeleteControlFrameInput {
  @Field((type) => Int)
  frameID: number;
}
