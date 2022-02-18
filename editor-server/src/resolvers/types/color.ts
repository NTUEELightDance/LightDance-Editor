import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
export class Color {
  @Field((type) => String)
  color: string;

  @Field((type) => String)
  colorCode: string;

  @Field((type) => ID)
  id: string;
}
