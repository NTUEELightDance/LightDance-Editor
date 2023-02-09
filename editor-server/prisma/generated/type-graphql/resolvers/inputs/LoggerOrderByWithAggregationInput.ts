import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LoggerAvgOrderByAggregateInput } from "../inputs/LoggerAvgOrderByAggregateInput";
import { LoggerCountOrderByAggregateInput } from "../inputs/LoggerCountOrderByAggregateInput";
import { LoggerMaxOrderByAggregateInput } from "../inputs/LoggerMaxOrderByAggregateInput";
import { LoggerMinOrderByAggregateInput } from "../inputs/LoggerMinOrderByAggregateInput";
import { LoggerSumOrderByAggregateInput } from "../inputs/LoggerSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("LoggerOrderByWithAggregationInput", {
  isAbstract: true
})
export class LoggerOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  user?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  variableValue?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  fieldName?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  time?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  status?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  errorMessage?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  result?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => LoggerCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: LoggerCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LoggerAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: LoggerAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LoggerMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: LoggerMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LoggerMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: LoggerMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LoggerSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: LoggerSumOrderByAggregateInput | undefined;
}
