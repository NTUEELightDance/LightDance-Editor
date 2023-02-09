import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameOrderByWithRelationInput } from "../inputs/EditingControlFrameOrderByWithRelationInput";
import { EditingPositionFrameOrderByWithRelationInput } from "../inputs/EditingPositionFrameOrderByWithRelationInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("UserOrderByWithRelationInput", {
  isAbstract: true
})
export class UserOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  password?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameOrderByWithRelationInput, {
    nullable: true
  })
  editingPositionFrameId?: EditingPositionFrameOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameOrderByWithRelationInput, {
    nullable: true
  })
  editingControlFrameId?: EditingControlFrameOrderByWithRelationInput | undefined;
}
