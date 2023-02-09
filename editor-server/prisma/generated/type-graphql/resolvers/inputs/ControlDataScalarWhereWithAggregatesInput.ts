import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { JsonWithAggregatesFilter } from "../inputs/JsonWithAggregatesFilter";

@TypeGraphQL.InputType("ControlDataScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ControlDataScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ControlDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ControlDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ControlDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ControlDataScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  partId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  frameId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => JsonWithAggregatesFilter, {
    nullable: true
  })
  value?: JsonWithAggregatesFilter | undefined;
}
