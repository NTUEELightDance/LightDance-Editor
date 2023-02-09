import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectCreateInput } from "../../../inputs/LEDEffectCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectCreateInput, {
    nullable: false
  })
  data!: LEDEffectCreateInput;
}
