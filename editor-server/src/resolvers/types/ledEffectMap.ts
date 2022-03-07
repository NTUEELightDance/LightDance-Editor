import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class LEDMap {
  @Field((type) => LEDMapScalar)
  LEDMap: Object[];
}

export const LEDMapScalar = new GraphQLScalarType({
  name: "LEDMapCustomScalar",
  description: "LED map scalar type",
  async serialize(allPart: any) {
    // check the type of received value
    const result: LooseObject = {};
    await Promise.all(
      allPart.map(async (partObj: any) => {
        const partName = partObj.name;
        const part: LooseObject = {};
        const allEffect = await db.LED.find({ partName });
        allEffect.map((effect: any) => {
          const { effectName, repeat, effects } = effect;
          // remove effects' _id
          const newEffects = effects.map((effectsData: any) => {
            const { effect, start, fade } = effectsData;
            // remove effect's _id
            const newEffect = effect.map((effectData: any) => {
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
