import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class ControlRecordPayload {
  @Field()
  mutation: ControlRecordMutation;

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

export enum ControlRecordMutation {
  CREATED_DELETED = "CREATED_DELETED",
  UPDATED_DELETED = "UPDATED_DELETED",
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
