import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("ColorScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ColorScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ColorScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ColorScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ColorScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ColorScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ColorScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ColorScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  color?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  colorCode?: StringWithAggregatesFilter | undefined;
}
