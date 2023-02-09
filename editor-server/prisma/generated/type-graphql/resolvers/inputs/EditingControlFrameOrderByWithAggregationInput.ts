import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameAvgOrderByAggregateInput } from "../inputs/EditingControlFrameAvgOrderByAggregateInput";
import { EditingControlFrameCountOrderByAggregateInput } from "../inputs/EditingControlFrameCountOrderByAggregateInput";
import { EditingControlFrameMaxOrderByAggregateInput } from "../inputs/EditingControlFrameMaxOrderByAggregateInput";
import { EditingControlFrameMinOrderByAggregateInput } from "../inputs/EditingControlFrameMinOrderByAggregateInput";
import { EditingControlFrameSumOrderByAggregateInput } from "../inputs/EditingControlFrameSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EditingControlFrameOrderByWithAggregationInput", {
  isAbstract: true
})
export class EditingControlFrameOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  userId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: EditingControlFrameCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: EditingControlFrameAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: EditingControlFrameMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: EditingControlFrameMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: EditingControlFrameSumOrderByAggregateInput | undefined;
}
