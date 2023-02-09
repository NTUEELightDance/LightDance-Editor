import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { JsonNullableListFilter } from "../inputs/JsonNullableListFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("LEDEffectScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class LEDEffectScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [LEDEffectScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: LEDEffectScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: LEDEffectScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: LEDEffectScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  partName?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  repeat?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  frames?: JsonNullableListFilter | undefined;
}
