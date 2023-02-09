import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameRelationFilter } from "../inputs/EditingPositionFrameRelationFilter";
import { IntFilter } from "../inputs/IntFilter";
import { PositionDataListRelationFilter } from "../inputs/PositionDataListRelationFilter";

@TypeGraphQL.InputType("PositionFrameWhereInput", {
  isAbstract: true
})
export class PositionFrameWhereInput {
  @TypeGraphQL.Field(_type => [PositionFrameWhereInput], {
    nullable: true
  })
  AND?: PositionFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameWhereInput], {
    nullable: true
  })
  OR?: PositionFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameWhereInput], {
    nullable: true
  })
  NOT?: PositionFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  start?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameRelationFilter, {
    nullable: true
  })
  editing?: EditingPositionFrameRelationFilter | undefined;

  @TypeGraphQL.Field(_type => PositionDataListRelationFilter, {
    nullable: true
  })
  positionDatas?: PositionDataListRelationFilter | undefined;
}
