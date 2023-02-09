import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameRelationFilter } from "../inputs/ControlFrameRelationFilter";
import { IntFilter } from "../inputs/IntFilter";
import { IntNullableFilter } from "../inputs/IntNullableFilter";
import { UserRelationFilter } from "../inputs/UserRelationFilter";

@TypeGraphQL.InputType("EditingControlFrameWhereInput", {
  isAbstract: true
})
export class EditingControlFrameWhereInput {
  @TypeGraphQL.Field(_type => [EditingControlFrameWhereInput], {
    nullable: true
  })
  AND?: EditingControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameWhereInput], {
    nullable: true
  })
  OR?: EditingControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameWhereInput], {
    nullable: true
  })
  NOT?: EditingControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  userId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntNullableFilter, {
    nullable: true
  })
  frameId?: IntNullableFilter | undefined;

  @TypeGraphQL.Field(_type => UserRelationFilter, {
    nullable: true
  })
  user?: UserRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ControlFrameRelationFilter, {
    nullable: true
  })
  editingFrame?: ControlFrameRelationFilter | undefined;
}
