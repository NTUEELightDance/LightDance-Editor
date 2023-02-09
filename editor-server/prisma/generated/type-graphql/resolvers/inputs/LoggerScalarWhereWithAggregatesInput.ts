import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { JsonNullableWithAggregatesFilter } from "../inputs/JsonNullableWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("LoggerScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class LoggerScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [LoggerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: LoggerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [LoggerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: LoggerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [LoggerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: LoggerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  user?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableWithAggregatesFilter, {
    nullable: true
  })
  variableValue?: JsonNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  fieldName?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  time?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  status?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableWithAggregatesFilter, {
    nullable: true
  })
  errorMessage?: JsonNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableWithAggregatesFilter, {
    nullable: true
  })
  result?: JsonNullableWithAggregatesFilter | undefined;
}
