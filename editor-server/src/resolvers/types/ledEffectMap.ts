import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import db from "../../models";
import { ILED, ILEDEffects, ILEDEffectsEffect, IPart } from "../../types/global";

interface IPartEffect {
  [key: string]: {
    repeat: number;
    effects: ILEDEffects[];
  }
}
interface IEffect {
  [key: string]: IPartEffect;
}

@ObjectType()
export class LEDMap {
  @Field((type) => LEDMapScalar)
    LEDMap: IPart[];
}

export const LEDMapScalar = new GraphQLScalarType({
  name: "LEDMapCustomScalar",
  description: "LED map scalar type",
  async serialize(allPart: IPart[]) {
    // check the type of received value
    const result: IEffect = {};
    await Promise.all(
      allPart.map(async (partObj) => {
        const partName = partObj.name;
        const part: IPartEffect = {};
        const allEffect: ILED[] = await db.LED.find({ partName });
        allEffect.map((effect) => {
          const { effectName, repeat, effects } = effect;
          // remove effects' _id
          const newEffects: ILEDEffects[] = effects.map((effectsData) => {
            const { effect, start, fade } = effectsData;
            // remove effect's _id
            const newEffect: ILEDEffectsEffect[] = effect.map((effectData) => {
              const { colorCode, alpha } = effectData;
              return { alpha, colorCode };
            });
            return { effect: newEffect, start, fade };
          });
          part[effectName] = { repeat, effects: newEffects };
        });
        result[partName] = part;
      })
    );
    return result;
  },
  parseValue(value: unknown): any {
    // check the type of received value

    return value; // value from the client input variables
  },
  parseLiteral(ast: any): any {
    // check the type of received value

    return ast.value; // value from the client query
  },
});
