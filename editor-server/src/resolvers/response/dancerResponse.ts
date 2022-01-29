// todo
// extend dancer, {ok, msg}
import { Field, ObjectType } from "type-graphql";
import { Dancer } from "../types/dancer";

@ObjectType()
export class DancerResponse extends Dancer {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
