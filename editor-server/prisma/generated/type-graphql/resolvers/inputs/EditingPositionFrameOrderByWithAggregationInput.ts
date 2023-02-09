import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameAvgOrderByAggregateInput } from "../inputs/EditingPositionFrameAvgOrderByAggregateInput";
import { EditingPositionFrameCountOrderByAggregateInput } from "../inputs/EditingPositionFrameCountOrderByAggregateInput";
import { EditingPositionFrameMaxOrderByAggregateInput } from "../inputs/EditingPositionFrameMaxOrderByAggregateInput";
import { EditingPositionFrameMinOrderByAggregateInput } from "../inputs/EditingPositionFrameMinOrderByAggregateInput";
import { EditingPositionFrameSumOrderByAggregateInput } from "../inputs/EditingPositionFrameSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EditingPositionFrameOrderByWithAggregationInput", {
  isAbstract: true
})
export class EditingPositionFrameOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  userId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: EditingPositionFrameCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: EditingPositionFrameAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: EditingPositionFrameMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: EditingPositionFrameMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: EditingPositionFrameSumOrderByAggregateInput | undefined;
}
