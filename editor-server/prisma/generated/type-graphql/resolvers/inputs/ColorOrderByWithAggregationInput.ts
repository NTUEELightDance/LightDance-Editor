import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ColorCountOrderByAggregateInput } from "../inputs/ColorCountOrderByAggregateInput";
import { ColorMaxOrderByAggregateInput } from "../inputs/ColorMaxOrderByAggregateInput";
import { ColorMinOrderByAggregateInput } from "../inputs/ColorMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ColorOrderByWithAggregationInput", {
  isAbstract: true
})
export class ColorOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  color?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  colorCode?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ColorCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ColorCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ColorMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ColorMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ColorMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ColorMinOrderByAggregateInput | undefined;
}
