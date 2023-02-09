import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameRelationFilter } from "../inputs/ControlFrameRelationFilter";
import { IntFilter } from "../inputs/IntFilter";
import { JsonFilter } from "../inputs/JsonFilter";
import { PartRelationFilter } from "../inputs/PartRelationFilter";

@TypeGraphQL.InputType("ControlDataWhereInput", {
  isAbstract: true
})
export class ControlDataWhereInput {
  @TypeGraphQL.Field(_type => [ControlDataWhereInput], {
    nullable: true
  })
  AND?: ControlDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereInput], {
    nullable: true
  })
  OR?: ControlDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereInput], {
    nullable: true
  })
  NOT?: ControlDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  partId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  frameId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => JsonFilter, {
    nullable: true
  })
  value?: JsonFilter | undefined;

  @TypeGraphQL.Field(_type => PartRelationFilter, {
    nullable: true
  })
  part?: PartRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ControlFrameRelationFilter, {
    nullable: true
  })
  frame?: ControlFrameRelationFilter | undefined;
}
