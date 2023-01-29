import { ObjectType, Field, registerEnumType } from "type-graphql";
import { Dancer } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class DancerPayload {
  @Field((type) => dancerMutation)
    mutation: dancerMutation;

  @Field()
    editBy: number;

  @Field((type) => Dancer, { nullable: true })
    dancerData?: Dancer | null;
}

export enum dancerMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}

registerEnumType(dancerMutation, {
  name: "dancerMutation",
});
