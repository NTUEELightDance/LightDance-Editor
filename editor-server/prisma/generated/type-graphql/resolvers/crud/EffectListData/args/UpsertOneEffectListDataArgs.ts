import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataCreateInput } from "../../../inputs/EffectListDataCreateInput";
import { EffectListDataUpdateInput } from "../../../inputs/EffectListDataUpdateInput";
import { EffectListDataWhereUniqueInput } from "../../../inputs/EffectListDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereUniqueInput, {
    nullable: false
  })
  where!: EffectListDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => EffectListDataCreateInput, {
    nullable: false
  })
  create!: EffectListDataCreateInput;

  @TypeGraphQL.Field(_type => EffectListDataUpdateInput, {
    nullable: false
  })
  update!: EffectListDataUpdateInput;
}
