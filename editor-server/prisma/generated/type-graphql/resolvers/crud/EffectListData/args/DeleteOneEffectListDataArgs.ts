import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataWhereUniqueInput } from "../../../inputs/EffectListDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereUniqueInput, {
    nullable: false
  })
  where!: EffectListDataWhereUniqueInput;
}
