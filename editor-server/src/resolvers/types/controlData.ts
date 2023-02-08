import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";

import redis from "../../redis";
import { TRedisControl, TRedisControls } from "../../types/global";

type TControlIDList = {
  createList: string[];
  deleteList: string[];
  updateList: string[];
};

type TControlID = {
  id: string;
};

type TControlDataFrame = TControlIDList | TControlID;

function isControlIDList(data: TControlDataFrame): data is TControlIDList {
  return "createList" in data;
}

type TControlDataScalar =
  | {
      createFrames: TRedisControls;
      updateFrames: TRedisControls;
      deleteFrames: string[];
    }
  | TRedisControls;

@ObjectType()
export class ControlData {
  @Field((type) => ControlDataScalar)
  frame: TControlDataFrame;
}

export const ControlDataScalar = new GraphQLScalarType({
  name: "ControlMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: TControlDataFrame): Promise<TControlDataScalar> {
    if (isControlIDList(data)) {
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
    } else {
      const { id } = data;
      const result: TRedisControls = {};
      const cache = await redis.get(id);
      if (cache) {
        const cacheObj: TRedisControl = JSON.parse(cache);
        result[id] = cacheObj;
      }
      return result;
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
