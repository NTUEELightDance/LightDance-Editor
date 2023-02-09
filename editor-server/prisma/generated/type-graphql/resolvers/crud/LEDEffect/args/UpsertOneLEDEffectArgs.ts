import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectCreateInput } from "../../../inputs/LEDEffectCreateInput";
import { LEDEffectUpdateInput } from "../../../inputs/LEDEffectUpdateInput";
import { LEDEffectWhereUniqueInput } from "../../../inputs/LEDEffectWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectWhereUniqueInput, {
    nullable: false
  })
  where!: LEDEffectWhereUniqueInput;

  @TypeGraphQL.Field(_type => LEDEffectCreateInput, {
    nullable: false
  })
  create!: LEDEffectCreateInput;

  @TypeGraphQL.Field(_type => LEDEffectUpdateInput, {
    nullable: false
  })
  update!: LEDEffectUpdateInput;
}
