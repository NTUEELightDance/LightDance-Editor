import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FloatWithAggregatesFilter } from "../inputs/FloatWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";

@TypeGraphQL.InputType("PositionDataScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class PositionDataScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [PositionDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: PositionDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: PositionDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: PositionDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  dancerId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  frameId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => FloatWithAggregatesFilter, {
    nullable: true
  })
  x?: FloatWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => FloatWithAggregatesFilter, {
    nullable: true
  })
  y?: FloatWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => FloatWithAggregatesFilter, {
    nullable: true
  })
  z?: FloatWithAggregatesFilter | undefined;
}
