import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolWithAggregatesFilter } from "../inputs/BoolWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";

@TypeGraphQL.InputType("ControlFrameScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ControlFrameScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  start?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => BoolWithAggregatesFilter, {
    nullable: true
  })
  fade?: BoolWithAggregatesFilter | undefined;
}
