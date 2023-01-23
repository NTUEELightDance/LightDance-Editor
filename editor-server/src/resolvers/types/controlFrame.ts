import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
export class ControlFrame {
  @Field((type) => Float)
  start: number;

  @Field((type) => Boolean)
  fade: boolean;

  @Field({ nullable: true })
  editing: string;

  @Field((type) => ID)
  id: string;
}
