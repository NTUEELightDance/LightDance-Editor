import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";

import redis from "../../redis";
import { TRedisPosition, TRedisPositions } from "../../types/global";

type TPositionDataFrame = {
  createList: string[];
  deleteList: string[];
  updateList: string[];
}
type TPositionDataScalar = {
  createFrames: TRedisPositions;
  updateFrames: TRedisPositions;
  deleteFrames: string[];
} | TRedisPositions

@ObjectType()
export class PosData {
  @Field((type) => PosDataScalar)
    frame: TPositionDataFrame;
}

export const PosDataScalar = new GraphQLScalarType({
  name: "PosMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: TPositionDataFrame): Promise<TPositionDataScalar> {
    // check the type of received value
    const { deleteList, createList, updateList } = data;
    const createFrames: TRedisPositions = {};
    await Promise.all(
      createList.map(async (id) => {
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisPosition = JSON.parse(cache);
          createFrames[id] = cacheObj;
        }
      })
    );
    const updateFrames: TRedisPositions = {};
    await Promise.all(
      updateList.map(async (id) => {
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisPosition = JSON.parse(cache);
          updateFrames[id] = cacheObj;
        }
      })
    );
    return { createFrames, deleteFrames: deleteList, updateFrames };
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
