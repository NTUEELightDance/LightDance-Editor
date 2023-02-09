import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LEDEffectAvgOrderByAggregateInput } from "../inputs/LEDEffectAvgOrderByAggregateInput";
import { LEDEffectCountOrderByAggregateInput } from "../inputs/LEDEffectCountOrderByAggregateInput";
import { LEDEffectMaxOrderByAggregateInput } from "../inputs/LEDEffectMaxOrderByAggregateInput";
import { LEDEffectMinOrderByAggregateInput } from "../inputs/LEDEffectMinOrderByAggregateInput";
import { LEDEffectSumOrderByAggregateInput } from "../inputs/LEDEffectSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("LEDEffectOrderByWithAggregationInput", {
  isAbstract: true
})
export class LEDEffectOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  partName?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  repeat?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frames?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => LEDEffectCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: LEDEffectCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LEDEffectAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: LEDEffectAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LEDEffectMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: LEDEffectMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LEDEffectMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: LEDEffectMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => LEDEffectSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: LEDEffectSumOrderByAggregateInput | undefined;
}
