import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongoose";

import redis from "../../redis";
import { TRedisControl, TRedisControls } from "../../types/global";

type TControlIDList = {
  createList: string[];
  deleteList: string[];
  updateList: string[];
}
type TControlID = {
  id: string;
  _id: ObjectId;
}
type TControlDataFrame = TControlIDList | TControlID;

type TControlDataScalar = {
  createFrames: TRedisControls;
  updateFrames: TRedisControls;
  deleteFrames: string[];
} | TRedisControls

@ObjectType()
export class ControlData {
  @Field((type) => ControlDataScalar)
    frame: TControlDataFrame;
}

export const ControlDataScalar = new GraphQLScalarType({
  name: "ControlMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: TControlDataFrame): Promise<TControlDataScalar> {
    // check the type of received value
    if ("id" in data && "_id" in data) {
      const {id, _id} = data;
      const result: TRedisControls = {};
      const cache = await redis.get(id);
      if (cache) {
        const cacheObj: TRedisControl = JSON.parse(cache);
        result[id] = cacheObj;
      }
      return result;
    } else {
      const { deleteList, createList, updateList } = data;
      const createFrames: TRedisControls = {};
      await Promise.all(
        createList.map(async (id) => {
          const cache = await redis.get(id);
          if (cache) {
            const cacheObj: TRedisControl = JSON.parse(cache);
            createFrames[id] = cacheObj;
          }
        })
      );
      const updateFrames: TRedisControls = {};
      await Promise.all(
        updateList.map(async (id) => {
          const cache = await redis.get(id);
          if (cache) {
            const cacheObj: TRedisControl = JSON.parse(cache);
            updateFrames[id] = cacheObj;
          }
        })
      );
      return { createFrames, deleteFrames: deleteList, updateFrames }; // value sent to the client
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
