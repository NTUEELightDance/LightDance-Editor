import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameOrderByWithRelationInput } from "../inputs/ControlFrameOrderByWithRelationInput";
import { PartOrderByWithRelationInput } from "../inputs/PartOrderByWithRelationInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ControlDataOrderByWithRelationInput", {
  isAbstract: true
})
export class ControlDataOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  partId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  value?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PartOrderByWithRelationInput, {
    nullable: true
  })
  part?: PartOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameOrderByWithRelationInput, {
    nullable: true
  })
  frame?: ControlFrameOrderByWithRelationInput | undefined;
}
