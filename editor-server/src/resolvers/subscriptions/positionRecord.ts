import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class PositionRecordPayload {
  @Field()
  mutation: PositionRecordMutation;

  @Field((type) => ID)
  frameID: string;

  @Field()
  editBy: string;

  @Field((type) => Int)
  index: number;
}

export enum PositionRecordMutation {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
