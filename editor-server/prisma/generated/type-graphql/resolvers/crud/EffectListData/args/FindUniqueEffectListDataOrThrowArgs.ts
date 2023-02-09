import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataWhereUniqueInput } from "../../../inputs/EffectListDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueEffectListDataOrThrowArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereUniqueInput, {
    nullable: false
  })
  where!: EffectListDataWhereUniqueInput;
}
