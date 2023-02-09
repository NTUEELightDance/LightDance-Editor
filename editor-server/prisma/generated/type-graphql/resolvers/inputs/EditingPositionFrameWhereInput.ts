import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFilter } from "../inputs/IntFilter";
import { IntNullableFilter } from "../inputs/IntNullableFilter";
import { PositionFrameRelationFilter } from "../inputs/PositionFrameRelationFilter";
import { UserRelationFilter } from "../inputs/UserRelationFilter";

@TypeGraphQL.InputType("EditingPositionFrameWhereInput", {
  isAbstract: true
})
export class EditingPositionFrameWhereInput {
  @TypeGraphQL.Field(_type => [EditingPositionFrameWhereInput], {
    nullable: true
  })
  AND?: EditingPositionFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameWhereInput], {
    nullable: true
  })
  OR?: EditingPositionFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameWhereInput], {
    nullable: true
  })
  NOT?: EditingPositionFrameWhereInput[] | undefined;

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

  @TypeGraphQL.Field(_type => PositionFrameRelationFilter, {
    nullable: true
  })
  editingFrame?: PositionFrameRelationFilter | undefined;
}
