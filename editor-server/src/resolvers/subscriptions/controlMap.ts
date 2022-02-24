import { ObjectType, Field, ID } from "type-graphql";
import { ObjectId } from "mongodb";
import { ControlDataScalar } from "../types/controlData";

@ObjectType()
export class ControlMapPayload {
  @Field()
  mutation: ControlMapMutation;

  @Field((type) => ControlDataScalar, { nullable: true })
  frame?: any;

  @Field({ nullable: true })
  frameID?: string;

  @Field()
  editBy: string;
}

export enum ControlMapMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
  MIXED = "MIXED",
}
