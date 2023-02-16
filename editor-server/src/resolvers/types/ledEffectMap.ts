import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import prisma from "../../prisma";
import { IPart } from "../../types/global";
import { Prisma } from "@prisma/client";

interface ILEDEffect {
  id: number;
  repeat: number;
  frames: Prisma.JsonValue[];
}
interface IPartEffect {
  [key: string]: ILEDEffect; 
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
        const allEffect = await prisma.lEDEffect.findMany({where: {partName: partName}});
        allEffect.map((effect) => {
          const name = effect.name;
          // remove name, partName from effect
          const newEffect = { id: effect.id, repeat: effect.repeat, frames: effect.frames };
          part[name] = newEffect;
        })
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
})
