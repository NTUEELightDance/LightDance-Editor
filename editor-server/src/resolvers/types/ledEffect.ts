import { Field, ObjectType, Float, Int } from "type-graphql";

@ObjectType()
export class LEDEffect {
  @Field((type) => String)
  partName: string;

  @Field((type) => String, {nullable: true})
  effectName?: string;

  @Field((type) => Int)
  repeat: number;

  @Field((type) => [LEDEffects])
  effects: LEDEffects[];
}

@ObjectType()
class LEDEffects {
  @Field((type) => Float)
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
