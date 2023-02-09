import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { JsonNullableListFilter } from "../inputs/JsonNullableListFilter";
import { StringNullableWithAggregatesFilter } from "../inputs/StringNullableWithAggregatesFilter";

@TypeGraphQL.InputType("EffectListDataScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class EffectListDataScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [EffectListDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: EffectListDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: EffectListDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: EffectListDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  start?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  end?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  description?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  dancerData?: JsonNullableListFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  controlFrames?: JsonNullableListFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  positionFrames?: JsonNullableListFilter | undefined;
}
