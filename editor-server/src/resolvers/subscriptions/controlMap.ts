import { ObjectType, Field, Int } from "type-graphql";
import { ControlDataScalar } from "../types/controlData";

@ObjectType()
export class ControlMapPayload {
  @Field((type) => ControlDataScalar)
  frame: any;

  @Field((type) => Int)
  editBy: number;
}
