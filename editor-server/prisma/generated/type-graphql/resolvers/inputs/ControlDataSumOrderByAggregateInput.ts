import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ControlDataSumOrderByAggregateInput", {
  isAbstract: true
})
export class ControlDataSumOrderByAggregateInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  partId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;
}
