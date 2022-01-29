import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class ControlRecordPayload {
  @Field()
  mutation: ControlRecordMutation;

  @Field((type) => ID)
  frameID: string;

  @Field()
  editBy: string;

  @Field((type) => Int)
  index: number;
}

export enum ControlRecordMutation {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
