import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import prisma from "../../prisma";
import { IPart } from "../../types/global";
import { LEDEffect } from "../../../prisma/generated/type-graphql";

interface IPartEffect {
  [key: string]: LEDEffect; 
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
          const { id, name, partName, repeat, frames } = effect;
          part[name] = effect;
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
