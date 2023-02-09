import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameAvgOrderByAggregateInput } from "../inputs/PositionFrameAvgOrderByAggregateInput";
import { PositionFrameCountOrderByAggregateInput } from "../inputs/PositionFrameCountOrderByAggregateInput";
import { PositionFrameMaxOrderByAggregateInput } from "../inputs/PositionFrameMaxOrderByAggregateInput";
import { PositionFrameMinOrderByAggregateInput } from "../inputs/PositionFrameMinOrderByAggregateInput";
import { PositionFrameSumOrderByAggregateInput } from "../inputs/PositionFrameSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PositionFrameOrderByWithAggregationInput", {
  isAbstract: true
})
export class PositionFrameOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  start?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PositionFrameCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: PositionFrameCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: PositionFrameAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: PositionFrameMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: PositionFrameMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: PositionFrameSumOrderByAggregateInput | undefined;
}
