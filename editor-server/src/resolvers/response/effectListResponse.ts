// todo
// extend dancer, {ok, msg}
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class EffectListResponse {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
