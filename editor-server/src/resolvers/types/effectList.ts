import { Field, ObjectType, ID, Float } from "type-graphql";
import { GraphQLScalarType } from "graphql";

import { TRedisControls, TRedisPositions } from "../../types/global";

type EffectListData = {
  control: TRedisControls;
  position: TRedisPositions;
};

@ObjectType()
export class EffectList {
  @Field((type) => Float)
  start: number;

  @Field((type) => Float)
  end: number;

  @Field({ nullable: true })
  description: string;

  @Field((type) => ID)
  id: string;

  @Field((type) => EffectListScalar)
  data: EffectListData;
}

export const EffectListScalar = new GraphQLScalarType({
  name: "EffectListObjectId",
  description: "Mongo object id scalar type",
  serialize(data: EffectListData) {
    // check the type of received value
    return data; // value sent to the client
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
