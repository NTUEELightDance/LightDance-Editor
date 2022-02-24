import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class PositionRecordPayload {
  @Field()
  mutation: PositionRecordMutation;

  @Field((type) => ID, { nullable: true })
  frameID?: string;

  @Field()
  editBy: string;

  @Field((type) => Int)
  index?: number;

  @Field((type) => [String], { nullable: true })
  addID?: string[];

  @Field((type) => [String], { nullable: true })
  deleteID?: string[];
}

export enum PositionRecordMutation {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  MIXED = "MIXED",
}
