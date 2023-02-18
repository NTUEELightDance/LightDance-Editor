import { ObjectType, Field, Int } from "type-graphql";
import { EffectListData } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class EffectListPayload {
  @Field()
  mutation: EffectListMutation;

  @Field((type) => Int)
  effectListID: number;

  @Field((type) => Int)
  editBy: number;

  @Field((type) => EffectListData, { nullable: true })
  effectListData?: any;
}

export enum EffectListMutation {
  CREATED = "CREATED",
  DELETED = "DELETED",
}
