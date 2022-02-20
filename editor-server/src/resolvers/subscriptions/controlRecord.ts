import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class ControlRecordPayload {
  @Field()
  mutation: ControlRecordMutation;

  @Field((type) => ID, {nullable: true})
  frameID?: string;

  @Field()
  editBy: string;

  @Field((type) => Int)
  index: number;

  @Field((type) => [String], {nullable: true})
  addID?: string[];

  @Field((type) => [String], {nullable: true})
  deleteID?: string[];
}

export enum ControlRecordMutation {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  MIXED = "MIXED"
}
