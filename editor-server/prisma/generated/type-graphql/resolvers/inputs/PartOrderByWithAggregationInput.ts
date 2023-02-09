import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartAvgOrderByAggregateInput } from "../inputs/PartAvgOrderByAggregateInput";
import { PartCountOrderByAggregateInput } from "../inputs/PartCountOrderByAggregateInput";
import { PartMaxOrderByAggregateInput } from "../inputs/PartMaxOrderByAggregateInput";
import { PartMinOrderByAggregateInput } from "../inputs/PartMinOrderByAggregateInput";
import { PartSumOrderByAggregateInput } from "../inputs/PartSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PartOrderByWithAggregationInput", {
  isAbstract: true
})
export class PartOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  dancerId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  type?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PartCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: PartCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PartAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: PartAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PartMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: PartMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PartMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: PartMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PartSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: PartSumOrderByAggregateInput | undefined;
}
