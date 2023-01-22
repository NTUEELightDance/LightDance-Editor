import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";

import { IColor, TColorMap } from "../../types/global";

@ObjectType()
export class ColorMap {
  @Field((type) => ColorMapScalar)
  colorMap: Object[];
}

export const ColorMapScalar = new GraphQLScalarType({
  name: "ColorMapCustomScalar",
  description: "Color map scalar type",
  async serialize(value: IColor[]) {
    // check the type of received value
    const result: TColorMap = {};
    value.map((data) => {
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
