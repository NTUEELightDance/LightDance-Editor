import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectWhereInput } from "../../../inputs/LEDEffectWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectWhereInput, {
    nullable: true
  })
  where?: LEDEffectWhereInput | undefined;
}
