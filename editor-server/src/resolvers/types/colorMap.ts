import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";
import redis from "../../redis";

interface LooseObject {
<<<<<<< HEAD
  [key: string]: any;
=======
    [key: string]: any;
>>>>>>> 9aa804f (EDITOR-#70 editor server trivial problems)
}

@ObjectType()
export class ColorMap {
<<<<<<< HEAD
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
      console.log(data);
      result[color] = colorCode;
    });
    console.log(result);
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
=======
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
            console.log(data);
            result[color] = colorCode;
        });
        console.log(result);
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
>>>>>>> 9aa804f (EDITOR-#70 editor server trivial problems)
