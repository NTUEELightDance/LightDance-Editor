import { ObjectType, Field, ID } from "type-graphql";
import { ObjectId } from "mongodb";
import { ControlDataScalar } from "../types/controlData";

@ObjectType()
export class ControlMapPayload {
  @Field((type) => ControlDataScalar)
    frame: any;

  @Field()
    editBy: number;
}
