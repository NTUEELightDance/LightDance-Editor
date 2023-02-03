import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";

import redis from "../../redis";
import { TRedisControl, TRedisPosition } from "../../types/global";

interface MapData {
  [key: string]: TRedisControl | TRedisPosition;
}


@ObjectType()
export class ControlMap {
  @Field((type) => ControlMapScalar)
    frameIds: string[];
}

@ObjectType()
export class PositionMap {
  @Field((type) => PositionMapScalar)
    frameIds: string[];
}

export const ControlMapScalar = new GraphQLScalarType({
  name: "ControlMapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: string[]): Promise<MapData> {
    const result: MapData = {};
    await Promise.all(
      value.map(async (frameId) => {
        const cache = await redis.get(`controlframe-${frameId}`);
        if (cache) {
          const cacheObj: TRedisControl = JSON.parse(cache);
          result[frameId] = cacheObj;
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
export const PositionMapScalar = new GraphQLScalarType({
  name: "PositionMapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: string[]): Promise<MapData> {
    const result: MapData = {};
    await Promise.all(
      value.map(async (frameId) => {
        const cache = await redis.get(`positionframe-${frameId}`);
        if (cache) {
          const cacheObj: TRedisPosition = JSON.parse(cache);
          result[frameId] = cacheObj;
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
