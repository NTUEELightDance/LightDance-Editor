import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongoose";

import redis from "../../redis";
import { TRedisControl, TRedisPosition } from "../../types/global";

interface MapID {
  id: string;
  _id: ObjectId;
}
interface MapData {
  [key: string]: TRedisControl | TRedisPosition;
}

@ObjectType()
export class Map {
  @Field((type) => MapScalar)
  frames: MapID[];
}

export const MapScalar = new GraphQLScalarType({
  name: "MapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: MapID[]): Promise<MapData> {
    const result: MapData = {};
    await Promise.all(
      value.map(async (data) => {
        const { id } = data;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisControl | TRedisPosition = JSON.parse(cache);
          result[id] = cacheObj;
        }
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
});
