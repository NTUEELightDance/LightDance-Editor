import { ObjectType, Field, ID, Int } from "type-graphql";
import { LEDEffect } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class LEDPayload {
  @Field()
  mutation: ledMutation;

  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  editBy?: number;

  @Field({ nullable: true })
  data?: LEDEffect;

  @Field({ nullable: true })
  partName?: string;

  @Field({ nullable: true })
  effectName?: string;
}

export enum ledMutation {
  RENAMED = "RENAMED",
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}
