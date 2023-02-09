import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerOrderByWithAggregationInput } from "../../../inputs/LoggerOrderByWithAggregationInput";
import { LoggerScalarWhereWithAggregatesInput } from "../../../inputs/LoggerScalarWhereWithAggregatesInput";
import { LoggerWhereInput } from "../../../inputs/LoggerWhereInput";
import { LoggerScalarFieldEnum } from "../../../../enums/LoggerScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerWhereInput, {
    nullable: true
  })
  where?: LoggerWhereInput | undefined;

  @TypeGraphQL.Field(_type => [LoggerOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: LoggerOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [LoggerScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "user" | "variableValue" | "fieldName" | "time" | "status" | "errorMessage" | "result">;

  @TypeGraphQL.Field(_type => LoggerScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: LoggerScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
