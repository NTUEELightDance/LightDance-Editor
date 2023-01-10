import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class RequestEditResponse {
  @Field((type) => String, { nullable: true })
    editing: string;

  @Field((type) => Boolean)
    ok: boolean;
}
