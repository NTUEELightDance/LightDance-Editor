import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataAvgOrderByAggregateInput } from "../inputs/PositionDataAvgOrderByAggregateInput";
import { PositionDataCountOrderByAggregateInput } from "../inputs/PositionDataCountOrderByAggregateInput";
import { PositionDataMaxOrderByAggregateInput } from "../inputs/PositionDataMaxOrderByAggregateInput";
import { PositionDataMinOrderByAggregateInput } from "../inputs/PositionDataMinOrderByAggregateInput";
import { PositionDataSumOrderByAggregateInput } from "../inputs/PositionDataSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PositionDataOrderByWithAggregationInput", {
  isAbstract: true
})
export class PositionDataOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  dancerId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  x?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  y?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  z?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PositionDataCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: PositionDataCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: PositionDataAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: PositionDataMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: PositionDataMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: PositionDataSumOrderByAggregateInput | undefined;
}
