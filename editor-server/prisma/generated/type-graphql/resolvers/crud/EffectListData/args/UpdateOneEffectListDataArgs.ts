import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataUpdateInput } from "../../../inputs/EffectListDataUpdateInput";
import { EffectListDataWhereUniqueInput } from "../../../inputs/EffectListDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataUpdateInput, {
    nullable: false
  })
  data!: EffectListDataUpdateInput;

  @TypeGraphQL.Field(_type => EffectListDataWhereUniqueInput, {
    nullable: false
  })
  where!: EffectListDataWhereUniqueInput;
}
