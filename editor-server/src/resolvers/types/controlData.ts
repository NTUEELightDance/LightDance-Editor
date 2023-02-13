import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";

import redis from "../../redis";
import { TRedisControl, TRedisControls } from "../../types/global";
import { getRedisControl } from "../../utility";

type TControlIDList = {
  createList: number[];
  deleteList: number[];
  updateList: number[];
};

type TControlID = {
  id: number;
};

type TControlDataFrame = TControlIDList | TControlID;

function isControlIDList(data: TControlDataFrame): data is TControlIDList {
  return "createList" in data;
}

type TControlDataScalar =
  | {
      createFrames: TRedisControls;
      updateFrames: TRedisControls;
      deleteFrames: number[];
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
          createFrames[id] = await getRedisControl(id);
        })
      );
      const updateFrames: TRedisControls = {};
      await Promise.all(
        updateList.map(async (id) => {
          updateFrames[id] = await getRedisControl(id);
        })
      );
      return { createFrames, deleteFrames: deleteList, updateFrames }; // value sent to the client
    } else {
      const { id } = data;
      const result: TRedisControls = {};
      result[id] = await getRedisControl(id);
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
