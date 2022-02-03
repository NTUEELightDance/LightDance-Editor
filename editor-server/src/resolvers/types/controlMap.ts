import {
  Field,
  ObjectType,
} from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import redis from "../../redis"

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class ControlMap {
  @Field((type) => ControlMapScalar)
  frames: ObjectId[];
}

export const ControlMapScalar = new GraphQLScalarType({
  name: "ControlMapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: any): Promise<any> {
    const result: LooseObject = {};
    await Promise.all(
      value.map(async (data: any) => {
        const { id } = data;
        const cache = await redis.get(id)
        if(cache){
          const cacheObj = JSON.parse(cache)
          result[id] = cacheObj
        }
      })   
    )
    return result
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
