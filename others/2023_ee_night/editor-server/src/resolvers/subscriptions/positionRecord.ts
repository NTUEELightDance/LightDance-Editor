import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class PositionRecordPayload {
  @Field()
  mutation: PositionRecordMutation;

  @Field((type) => Int)
  editBy: number;

  @Field((type) => Int)
  index: number;

  @Field((type) => [Int])
  addID: number[];

  @Field((type) => [Int])
  updateID: number[];

  @Field((type) => [Int])
  deleteID: number[];
}

export enum PositionRecordMutation {
  CREATED_DELETED = "CREATED_DELETED",
  UPDATED_DELETED = "UPDATED_DELETED",
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
