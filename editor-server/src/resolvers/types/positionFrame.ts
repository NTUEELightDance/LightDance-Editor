import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
export class PositionFrame {
  @Field((type) => Float)
    start: number;

  @Field({ nullable: true })
    editing: string;

  @Field((type) => ID)
    id: string;
}
