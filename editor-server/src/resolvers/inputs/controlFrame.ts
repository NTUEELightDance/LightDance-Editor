import { InputType, Field } from "type-graphql";

@InputType()
export class EditControlFrameInput {
  @Field()
  frameID: string;

  @Field({ nullable: true })
  start?: number;

  @Field({ nullable: true })
  fade?: boolean;
}

@InputType()
export class DeleteControlFrameInput {
  @Field()
  frameID: string;
}
