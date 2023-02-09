import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameOrderByWithRelationInput } from "../inputs/EditingPositionFrameOrderByWithRelationInput";
import { PositionDataOrderByRelationAggregateInput } from "../inputs/PositionDataOrderByRelationAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PositionFrameOrderByWithRelationInput", {
  isAbstract: true
})
export class PositionFrameOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  start?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameOrderByWithRelationInput, {
    nullable: true
  })
  editing?: EditingPositionFrameOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataOrderByRelationAggregateInput, {
    nullable: true
  })
  positionDatas?: PositionDataOrderByRelationAggregateInput | undefined;
}
