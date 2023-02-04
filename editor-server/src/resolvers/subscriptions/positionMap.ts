import { ObjectType, Field, ID } from "type-graphql";
import { ObjectId } from "mongodb";
import { PosData, PosDataScalar } from "../types/posData";

@ObjectType()
export class PositionMapPayload {
  @Field((type) => PosDataScalar)
    frame: any;

  @Field()
    editBy: string;
}
