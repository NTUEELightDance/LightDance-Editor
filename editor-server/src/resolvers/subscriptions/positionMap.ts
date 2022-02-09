import { ObjectType, Field, ID } from "type-graphql";
import { ObjectId } from "mongodb";
import { PosData, PosDataScalar } from "../types/posData";

@ObjectType()
export class PositionMapPayload {
  @Field()
  mutation: PositionMapMutation;

  @Field((type) => PosDataScalar, { nullable: true })
  frame?: any[];

  @Field()
  frameID: string;

  @Field()
  editBy: string;
}

export enum PositionMapMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}
