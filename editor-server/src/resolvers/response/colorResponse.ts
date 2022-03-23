// todo
// extend dancer, {ok, msg}
import { Field, ObjectType } from "type-graphql";
import { Color } from "../types/color";

@ObjectType()
export class ColorResponse extends Color {
  @Field((type) => Boolean, { nullable: true })
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
