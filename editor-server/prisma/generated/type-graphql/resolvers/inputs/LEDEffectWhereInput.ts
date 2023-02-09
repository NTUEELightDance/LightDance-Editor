import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFilter } from "../inputs/IntFilter";
import { JsonNullableListFilter } from "../inputs/JsonNullableListFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("LEDEffectWhereInput", {
  isAbstract: true
})
export class LEDEffectWhereInput {
  @TypeGraphQL.Field(_type => [LEDEffectWhereInput], {
    nullable: true
  })
  AND?: LEDEffectWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectWhereInput], {
    nullable: true
  })
  OR?: LEDEffectWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectWhereInput], {
    nullable: true
  })
  NOT?: LEDEffectWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  partName?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  repeat?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  frames?: JsonNullableListFilter | undefined;
}
