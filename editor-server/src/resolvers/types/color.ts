import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Color {
  @Field((type) => String)
  color: string;

  @Field((type) => String)
  colorCode: string;
}
