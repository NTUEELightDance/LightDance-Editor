import { InputType, Field, Float, Int } from "type-graphql";
import { LEDEffectCreateframesInput } from "../../../prisma/generated/type-graphql";

@InputType()
export class AddLEDInput {
  @Field((type) => String)
  partName: string;

  @Field((type) => String)
  effectName: string;

  @Field((type) => Int)
  repeat: number;

  @Field((type) => [LEDEffectInput])
  effects: LEDEffectInput[];
}

@InputType()
export class EditLEDInput {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  name: string;

  @Field((type) => Int)
  repeat: number;

  @Field((type) => LEDEffectCreateframesInput, { nullable: true })
  frames?: LEDEffectCreateframesInput | undefined;
}

@InputType()
export class DeleteLEDInput {
  @Field((type) => String)
  partName: string;

  @Field((type) => String)
  effectName: string;
}

@InputType()
export class LEDEffectInput {
  @Field((type) => Int)
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
