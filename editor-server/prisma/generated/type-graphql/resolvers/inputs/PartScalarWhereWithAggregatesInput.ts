import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EnumPartTypeWithAggregatesFilter } from "../inputs/EnumPartTypeWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("PartScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class PartScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [PartScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: PartScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: PartScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: PartScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  dancerId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => EnumPartTypeWithAggregatesFilter, {
    nullable: true
  })
  type?: EnumPartTypeWithAggregatesFilter | undefined;
}
