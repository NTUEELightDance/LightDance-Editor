import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FloatFilter } from "../inputs/FloatFilter";
import { IntFilter } from "../inputs/IntFilter";

@TypeGraphQL.InputType("PositionDataScalarWhereInput", {
  isAbstract: true
})
export class PositionDataScalarWhereInput {
  @TypeGraphQL.Field(_type => [PositionDataScalarWhereInput], {
    nullable: true
  })
  AND?: PositionDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereInput], {
    nullable: true
  })
  OR?: PositionDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereInput], {
    nullable: true
  })
  NOT?: PositionDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  dancerId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  frameId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => FloatFilter, {
    nullable: true
  })
  x?: FloatFilter | undefined;

  @TypeGraphQL.Field(_type => FloatFilter, {
    nullable: true
  })
  y?: FloatFilter | undefined;

  @TypeGraphQL.Field(_type => FloatFilter, {
    nullable: true
  })
  z?: FloatFilter | undefined;
}
