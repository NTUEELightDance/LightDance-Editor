import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";
import redis from "../../redis";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class ColorMap {
  @Field((type) => ColorMapScalar)
  colorMap: Object[];
}

export const ColorMapScalar = new GraphQLScalarType({
  name: "ColorMapCustomScalar",
  description: "Color map scalar type",
  async serialize(value: any) {
    // check the type of received value
    const result: LooseObject = {};
    value.map((data: any) => {
      const { color, colorCode } = data;
      result[color] = colorCode;
    });
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
