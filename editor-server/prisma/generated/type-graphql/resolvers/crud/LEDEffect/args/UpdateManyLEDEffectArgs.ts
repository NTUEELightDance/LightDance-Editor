import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectUpdateManyMutationInput } from "../../../inputs/LEDEffectUpdateManyMutationInput";
import { LEDEffectWhereInput } from "../../../inputs/LEDEffectWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectUpdateManyMutationInput, {
    nullable: false
  })
  data!: LEDEffectUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => LEDEffectWhereInput, {
    nullable: true
  })
  where?: LEDEffectWhereInput | undefined;
}
