import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class ControlRecordPayload {
  @Field()
    mutation: ControlRecordMutation;

  @Field()
    editBy: string;

  @Field((type) => Int)
    index: number;

  @Field((type) => [String])
    addID: string[];

  @Field((type) => [String])
    updateID: string[];

  @Field((type) => [String])
    deleteID: string[];
}

export enum ControlRecordMutation {
  CREATED_DELETED = "CREATED_DELETED",
  UPDATED_DELETED = "UPDATED_DELETED",
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
