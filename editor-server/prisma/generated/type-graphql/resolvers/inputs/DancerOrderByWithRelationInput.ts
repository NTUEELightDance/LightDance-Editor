import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartOrderByRelationAggregateInput } from "../inputs/PartOrderByRelationAggregateInput";
import { PositionDataOrderByRelationAggregateInput } from "../inputs/PositionDataOrderByRelationAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("DancerOrderByWithRelationInput", {
  isAbstract: true
})
export class DancerOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PartOrderByRelationAggregateInput, {
    nullable: true
  })
  parts?: PartOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataOrderByRelationAggregateInput, {
    nullable: true
  })
  positionData?: PositionDataOrderByRelationAggregateInput | undefined;
}
