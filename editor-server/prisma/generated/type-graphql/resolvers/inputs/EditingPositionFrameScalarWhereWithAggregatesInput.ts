import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntNullableWithAggregatesFilter } from "../inputs/IntNullableWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";

@TypeGraphQL.InputType("EditingPositionFrameScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class EditingPositionFrameScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [EditingPositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: EditingPositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: EditingPositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: EditingPositionFrameScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  userId?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntNullableWithAggregatesFilter, {
    nullable: true
  })
  frameId?: IntNullableWithAggregatesFilter | undefined;
}
