
import { ObjectType, Field, ID, Int } from "type-graphql";
import { EffectListData } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class EffectListPayload {
  @Field()
    mutation: EffectListMutation;

  @Field((type) => ID)
    effectListID: number;

  @Field()
    editBy: number;

  @Field((type) => EffectListData, { nullable: true })
    effectListData?: any;
}

export enum EffectListMutation {
  CREATED = "CREATED",
  DELETED = "DELETED",
}
