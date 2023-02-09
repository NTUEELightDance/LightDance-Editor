import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataAvgOrderByAggregateInput } from "../inputs/ControlDataAvgOrderByAggregateInput";
import { ControlDataCountOrderByAggregateInput } from "../inputs/ControlDataCountOrderByAggregateInput";
import { ControlDataMaxOrderByAggregateInput } from "../inputs/ControlDataMaxOrderByAggregateInput";
import { ControlDataMinOrderByAggregateInput } from "../inputs/ControlDataMinOrderByAggregateInput";
import { ControlDataSumOrderByAggregateInput } from "../inputs/ControlDataSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ControlDataOrderByWithAggregationInput", {
  isAbstract: true
})
export class ControlDataOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  partId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  value?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ControlDataCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ControlDataCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: ControlDataAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ControlDataMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ControlDataMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: ControlDataSumOrderByAggregateInput | undefined;
}
