import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LEDEffectNamePartNameCompoundUniqueInput } from "../inputs/LEDEffectNamePartNameCompoundUniqueInput";

@TypeGraphQL.InputType("LEDEffectWhereUniqueInput", {
  isAbstract: true
})
export class LEDEffectWhereUniqueInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id?: number | undefined;

  @TypeGraphQL.Field(_type => LEDEffectNamePartNameCompoundUniqueInput, {
    nullable: true
  })
  name_partName?: LEDEffectNamePartNameCompoundUniqueInput | undefined;
}
