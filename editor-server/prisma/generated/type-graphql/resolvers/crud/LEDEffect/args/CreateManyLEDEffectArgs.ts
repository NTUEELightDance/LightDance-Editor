import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectCreateManyInput } from "../../../inputs/LEDEffectCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyLEDEffectArgs {
  @TypeGraphQL.Field(_type => [LEDEffectCreateManyInput], {
    nullable: false
  })
  data!: LEDEffectCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
