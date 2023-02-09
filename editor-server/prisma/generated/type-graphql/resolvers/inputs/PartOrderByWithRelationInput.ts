import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataOrderByRelationAggregateInput } from "../inputs/ControlDataOrderByRelationAggregateInput";
import { DancerOrderByWithRelationInput } from "../inputs/DancerOrderByWithRelationInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PartOrderByWithRelationInput", {
  isAbstract: true
})
export class PartOrderByWithRelationInput {
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

  @TypeGraphQL.Field(_type => DancerOrderByWithRelationInput, {
    nullable: true
  })
  dancer?: DancerOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataOrderByRelationAggregateInput, {
    nullable: true
  })
  controlData?: ControlDataOrderByRelationAggregateInput | undefined;
}
