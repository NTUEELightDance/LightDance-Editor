import { ObjectType, Field, registerEnumType } from "type-graphql";
import { Dancer } from "../types/dancer";

@ObjectType()
export class DancerPayload {
  @Field((type) => dancerMutation)
  mutation: dancerMutation;

  @Field()
  editBy: string;

  @Field((type) => Dancer, { nullable: true })
  dancerData?: Dancer;
}

export enum dancerMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}

registerEnumType(dancerMutation, {
  name: "dancerMutation",
});
