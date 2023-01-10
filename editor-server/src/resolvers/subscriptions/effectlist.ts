import { ObjectType, Field, ID, Int } from "type-graphql";
import { EffectList } from "../types/effectList";

@ObjectType()
export class EffectListPayload {
  @Field()
    mutation: EffectListMutation;

  @Field((type) => ID)
    effectListID: string;

  @Field()
    editBy: string;

  @Field((type) => EffectList, { nullable: true })
    effectListData?: any;
}

export enum EffectListMutation {
  CREATED = "CREATED",
  DELETED = "DELETED",
}
