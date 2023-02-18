// todo
// extend dancer, {ok, msg}
import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class LEDEffectResponse {
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

  @Field((type) => [Effect])
  effect: Effect[];
}

@ObjectType()
class Effect {
  @Field()
  colorCode: string;

  @Field((type) => Float)
  alpha: number;
}

@ObjectType()
export class DeleteLEDEffectResponse {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
