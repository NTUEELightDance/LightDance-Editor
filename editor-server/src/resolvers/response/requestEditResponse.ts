import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class RequestEditResponse {
  @Field((type) => Int, { nullable: true })
  editing: number;

  @Field((type) => Boolean)
  ok: boolean;
}
