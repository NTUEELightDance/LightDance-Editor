// todo
// extend dancer, {ok, msg}
import { Field, ObjectType } from "type-graphql";
import { LEDEffect } from "../types/ledEffect";

@ObjectType()
export class LEDEffectResponse extends LEDEffect {
  @Field((type) => Boolean)
    ok: boolean;

  @Field((type) => String, { nullable: true })
    msg: string;
}

@ObjectType()
export class DeleteLEDEffectResponse {
  @Field((type) => Boolean)
    ok: boolean;

  @Field((type) => String, { nullable: true })
    msg: string;
}
