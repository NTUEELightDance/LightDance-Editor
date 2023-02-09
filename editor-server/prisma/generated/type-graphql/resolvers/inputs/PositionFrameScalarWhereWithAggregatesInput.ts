import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";

@TypeGraphQL.InputType("PositionFrameScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class PositionFrameScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [PositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: PositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: PositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: PositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  start?: IntWithAggregatesFilter | undefined;
}
