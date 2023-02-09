import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolFilter } from "../inputs/BoolFilter";
import { ControlDataListRelationFilter } from "../inputs/ControlDataListRelationFilter";
import { EditingControlFrameRelationFilter } from "../inputs/EditingControlFrameRelationFilter";
import { IntFilter } from "../inputs/IntFilter";

@TypeGraphQL.InputType("ControlFrameWhereInput", {
  isAbstract: true
})
export class ControlFrameWhereInput {
  @TypeGraphQL.Field(_type => [ControlFrameWhereInput], {
    nullable: true
  })
  AND?: ControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameWhereInput], {
    nullable: true
  })
  OR?: ControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameWhereInput], {
    nullable: true
  })
  NOT?: ControlFrameWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  start?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => BoolFilter, {
    nullable: true
  })
  fade?: BoolFilter | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameRelationFilter, {
    nullable: true
  })
  editing?: EditingControlFrameRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ControlDataListRelationFilter, {
    nullable: true
  })
  controlDatas?: ControlDataListRelationFilter | undefined;
}
