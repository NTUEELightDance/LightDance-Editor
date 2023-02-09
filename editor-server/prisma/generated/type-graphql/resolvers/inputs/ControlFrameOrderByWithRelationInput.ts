import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataOrderByRelationAggregateInput } from "../inputs/ControlDataOrderByRelationAggregateInput";
import { EditingControlFrameOrderByWithRelationInput } from "../inputs/EditingControlFrameOrderByWithRelationInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ControlFrameOrderByWithRelationInput", {
  isAbstract: true
})
export class ControlFrameOrderByWithRelationInput {
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
  fade?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameOrderByWithRelationInput, {
    nullable: true
  })
  editing?: EditingControlFrameOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataOrderByRelationAggregateInput, {
    nullable: true
  })
  controlDatas?: ControlDataOrderByRelationAggregateInput | undefined;
}
