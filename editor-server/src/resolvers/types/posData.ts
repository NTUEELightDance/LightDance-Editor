import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import redis from "../../redis";
import { getRedisPosition } from "../../utility";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class PosData {
  @Field((type) => PosDataScalar)
  frame: number;
}

export const PosDataScalar = new GraphQLScalarType({
  name: "PosMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: any): Promise<any> {
    // check the type of received value
    const { id, _id, deleteList, createList, updateList } = data;
    if (id && _id) {
      const result: LooseObject = {};
      result[id] = await getRedisPosition(id);
      return result;
    } else {
      const createFrames: LooseObject = {};
      await Promise.all(
        createList.map(async (id: any) => {
          createFrames[id] = await getRedisPosition(id);
        })
      );
      const updateFrames: LooseObject = {};
      await Promise.all(
        updateList.map(async (id: any) => {
          updateFrames[id] = await getRedisPosition(id);
        })
      );
      return { createFrames, deleteFrames: deleteList, updateFrames };
    }
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
