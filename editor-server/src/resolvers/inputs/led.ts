import { InputType, Field, Float, Int } from "type-graphql";

@InputType()
export class AddLEDInput {
  @Field((type) => String)
  partName: string;

  @Field((type) => String, {nullable: true})
  effectName?: string;

  @Field((type) => Int)
  repeat: number;

  @Field((type) => [LEDEffectInput])
  effects: LEDEffectInput[];
}

@InputType()
export class DeleteLEDInput {
  @Field((type) => String)
  partName: string;

  @Field((type) => String, {nullable: true})
  effectName?: string;
}

@InputType()
export class LEDEffectInput {
  @Field((type) => Float)
  start: number;

  @Field()
  fade: boolean;

  @Field((type) => [EffectInput])
  effect: EffectInput[];
}

@InputType()
class EffectInput {
  @Field()
  colorCode: string;

  @Field((type) => Float)
  alpha: number;
}
