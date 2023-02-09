import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectUpdateInput } from "../../../inputs/LEDEffectUpdateInput";
import { LEDEffectWhereUniqueInput } from "../../../inputs/LEDEffectWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectUpdateInput, {
    nullable: false
  })
  data!: LEDEffectUpdateInput;

  @TypeGraphQL.Field(_type => LEDEffectWhereUniqueInput, {
    nullable: false
  })
  where!: LEDEffectWhereUniqueInput;
}
