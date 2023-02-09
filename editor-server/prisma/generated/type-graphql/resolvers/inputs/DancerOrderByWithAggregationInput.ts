import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerAvgOrderByAggregateInput } from "../inputs/DancerAvgOrderByAggregateInput";
import { DancerCountOrderByAggregateInput } from "../inputs/DancerCountOrderByAggregateInput";
import { DancerMaxOrderByAggregateInput } from "../inputs/DancerMaxOrderByAggregateInput";
import { DancerMinOrderByAggregateInput } from "../inputs/DancerMinOrderByAggregateInput";
import { DancerSumOrderByAggregateInput } from "../inputs/DancerSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("DancerOrderByWithAggregationInput", {
  isAbstract: true
})
export class DancerOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => DancerCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: DancerCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DancerAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: DancerAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DancerMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: DancerMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DancerMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: DancerMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => DancerSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: DancerSumOrderByAggregateInput | undefined;
}
