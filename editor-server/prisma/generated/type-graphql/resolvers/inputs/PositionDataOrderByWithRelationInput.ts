import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerOrderByWithRelationInput } from "../inputs/DancerOrderByWithRelationInput";
import { PositionFrameOrderByWithRelationInput } from "../inputs/PositionFrameOrderByWithRelationInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PositionDataOrderByWithRelationInput", {
  isAbstract: true
})
export class PositionDataOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  dancerId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  frameId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  x?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  y?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  z?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => DancerOrderByWithRelationInput, {
    nullable: true
  })
  dancer?: DancerOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameOrderByWithRelationInput, {
    nullable: true
  })
  frame?: PositionFrameOrderByWithRelationInput | undefined;
}
