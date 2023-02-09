import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { IntFilter } from "../inputs/IntFilter";
import { JsonNullableFilter } from "../inputs/JsonNullableFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("LoggerWhereInput", {
  isAbstract: true
})
export class LoggerWhereInput {
  @TypeGraphQL.Field(_type => [LoggerWhereInput], {
    nullable: true
  })
  AND?: LoggerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [LoggerWhereInput], {
    nullable: true
  })
  OR?: LoggerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [LoggerWhereInput], {
    nullable: true
  })
  NOT?: LoggerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  user?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  variableValue?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  fieldName?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  time?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  status?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  errorMessage?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  result?: JsonNullableFilter | undefined;
}
