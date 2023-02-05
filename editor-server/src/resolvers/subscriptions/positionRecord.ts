import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class PositionRecordPayload {
  @Field()
    mutation: PositionRecordMutation;

  @Field()
    editBy: number;

  @Field((type) => Int)
    index: number;

  @Field((type) => [String])
    addID: number[];

  @Field((type) => [String])
    updateID: number[];

  @Field((type) => [String])
    deleteID: number[];
}

export enum PositionRecordMutation {
  CREATED_DELETED = "CREATED_DELETED",
  UPDATED_DELETED = "UPDATED_DELETED",
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}