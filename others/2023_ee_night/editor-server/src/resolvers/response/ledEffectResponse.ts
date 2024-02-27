// todo
// extend dancer, {ok, msg}
import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class LEDEffectResponse {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  partName: string;

  @Field((type) => String)
  effectName: string;

  @Field((type) => Int)
  repeat: number;

  @Field((type) => [LEDEffects])
  effects: LEDEffects[];

  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}

@ObjectType()
class LEDEffects {
  @Field((type) => Int)
  start: number;

  @Field()
  fade: boolean;

  @Field((type) => [[Int]])
  LEDs: [number[]];
}

@ObjectType()
export class DeleteLEDEffectResponse {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
