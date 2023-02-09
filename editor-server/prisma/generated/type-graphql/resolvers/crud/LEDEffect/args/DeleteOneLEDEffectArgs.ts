import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectWhereUniqueInput } from "../../../inputs/LEDEffectWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectWhereUniqueInput, {
    nullable: false
  })
  where!: LEDEffectWhereUniqueInput;
}
