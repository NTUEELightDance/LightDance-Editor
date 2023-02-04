import { InputType, Field, ObjectType, ID } from "type-graphql";

@InputType()
export class EditPositionInput {
  @Field(type=>[Number])
    pos: number[];
}
