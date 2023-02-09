import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("DancerScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class DancerScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [DancerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: DancerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [DancerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: DancerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [DancerScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: DancerScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;
}
