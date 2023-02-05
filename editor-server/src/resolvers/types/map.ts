import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType } from "graphql";

import redis from "../../redis";
import { TRedisControl, TRedisPosition } from "../../types/global";

interface MapID {
  id: number;
}

@ObjectType()
export class ControlMap {
  @Field((type) => ControlMapScalar)
    frameIds: MapID[];
}

@ObjectType()
export class PositionMap {
  @Field((type) => PositionMapScalar)
    frameIds: MapID[];
}

export const ControlMapScalar = new GraphQLScalarType({
  name: "ControlMapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: string[]): Promise<{ [key: string]: TRedisControl }> {
    const result: { [key: string]: TRedisControl } = {};
    await Promise.all(
      value.map(async (frameId) => {
        const cache = await redis.get(`CTRLFRAME_${frameId}`);
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
  async serialize(value: string[]): Promise<{ [key: string]: TRedisPosition }> {
    const result: { [key: string]: TRedisPosition } = {};
    await Promise.all(
      value.map(async (frameId) => {
        const cache = await redis.get(`POSFRAME_${frameId}`);
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