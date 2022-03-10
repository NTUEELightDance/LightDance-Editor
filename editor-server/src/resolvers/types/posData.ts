import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";
import redis from "../../redis";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class PosData {
  @Field((type) => PosDataScalar)
  frame: ObjectId;
}

export const PosDataScalar = new GraphQLScalarType({
  name: "PosMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: any): Promise<any> {
    // check the type of received value
    let { id, _id, deleteList, createList, updateList } = data;
    if(id && _id){
      const result: LooseObject = {};
      const cache = await redis.get(id);
      if (cache) {
        const cacheObj = JSON.parse(cache);
        result[id] = cacheObj;
      }
      return result;
    }else{
      const createFrames: LooseObject = {};
      await Promise.all(
        createList.map(async (id: any) => {
          const cache = await redis.get(id);
          if (cache) {
            const cacheObj = JSON.parse(cache);
            createFrames[id] = cacheObj;
          }
        })
      );
      const updateFrames: LooseObject = {};
      await Promise.all(
        updateList.map(async (id: any) => {
          const cache = await redis.get(id);
          if (cache) {
            const cacheObj = JSON.parse(cache);
            updateFrames[id] = cacheObj;
          }
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
