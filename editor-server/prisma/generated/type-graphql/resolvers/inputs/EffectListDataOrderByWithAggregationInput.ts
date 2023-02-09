import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EffectListDataAvgOrderByAggregateInput } from "../inputs/EffectListDataAvgOrderByAggregateInput";
import { EffectListDataCountOrderByAggregateInput } from "../inputs/EffectListDataCountOrderByAggregateInput";
import { EffectListDataMaxOrderByAggregateInput } from "../inputs/EffectListDataMaxOrderByAggregateInput";
import { EffectListDataMinOrderByAggregateInput } from "../inputs/EffectListDataMinOrderByAggregateInput";
import { EffectListDataSumOrderByAggregateInput } from "../inputs/EffectListDataSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EffectListDataOrderByWithAggregationInput", {
  isAbstract: true
})
export class EffectListDataOrderByWithAggregationInput {
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
  end?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  description?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  dancerData?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  controlFrames?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  positionFrames?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EffectListDataCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: EffectListDataCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: EffectListDataAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: EffectListDataMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: EffectListDataMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: EffectListDataSumOrderByAggregateInput | undefined;
}
