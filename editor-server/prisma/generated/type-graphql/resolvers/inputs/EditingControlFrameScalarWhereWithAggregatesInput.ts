import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntNullableWithAggregatesFilter } from "../inputs/IntNullableWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";

@TypeGraphQL.InputType("EditingControlFrameScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class EditingControlFrameScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [EditingControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: EditingControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: EditingControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: EditingControlFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  userId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntNullableWithAggregatesFilter, {
    nullable: true
  })
  frameId?: IntNullableWithAggregatesFilter | undefined;
}
