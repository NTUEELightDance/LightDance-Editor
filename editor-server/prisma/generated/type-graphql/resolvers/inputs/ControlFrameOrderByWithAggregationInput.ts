import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameAvgOrderByAggregateInput } from "../inputs/ControlFrameAvgOrderByAggregateInput";
import { ControlFrameCountOrderByAggregateInput } from "../inputs/ControlFrameCountOrderByAggregateInput";
import { ControlFrameMaxOrderByAggregateInput } from "../inputs/ControlFrameMaxOrderByAggregateInput";
import { ControlFrameMinOrderByAggregateInput } from "../inputs/ControlFrameMinOrderByAggregateInput";
import { ControlFrameSumOrderByAggregateInput } from "../inputs/ControlFrameSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ControlFrameOrderByWithAggregationInput", {
  isAbstract: true
})
export class ControlFrameOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  start?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  fade?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ControlFrameCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ControlFrameCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: ControlFrameAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ControlFrameMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ControlFrameMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: ControlFrameSumOrderByAggregateInput | undefined;
}
