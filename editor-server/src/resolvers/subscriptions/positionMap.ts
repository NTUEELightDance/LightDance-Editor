import { ObjectType, Field, Int } from "type-graphql";
import { PosData, PosDataScalar } from "../types/posData";

@ObjectType()
export class PositionMapPayload {
  @Field((type) => PosDataScalar)
  frame: any;

  @Field((type) => Int)
  editBy: number;
}
