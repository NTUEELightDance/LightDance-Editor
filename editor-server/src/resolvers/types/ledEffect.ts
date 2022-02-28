import { Field, ObjectType, Float, Int } from "type-graphql";

@ObjectType()
export class LEDEffect {
  @Field((type) => String)
  partName: string;

  @Field((type) => String)
  effectName: string;

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

  @Field((type) => [String])
  effect: string[];
}
