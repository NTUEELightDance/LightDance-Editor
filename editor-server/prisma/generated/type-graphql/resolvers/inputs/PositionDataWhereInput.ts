import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerRelationFilter } from "../inputs/DancerRelationFilter";
import { FloatFilter } from "../inputs/FloatFilter";
import { IntFilter } from "../inputs/IntFilter";
import { PositionFrameRelationFilter } from "../inputs/PositionFrameRelationFilter";

@TypeGraphQL.InputType("PositionDataWhereInput", {
  isAbstract: true
})
export class PositionDataWhereInput {
  @TypeGraphQL.Field(_type => [PositionDataWhereInput], {
    nullable: true
  })
  AND?: PositionDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereInput], {
    nullable: true
  })
  OR?: PositionDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereInput], {
    nullable: true
  })
  NOT?: PositionDataWhereInput[] | undefined;

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

  @TypeGraphQL.Field(_type => DancerRelationFilter, {
    nullable: true
  })
  dancer?: DancerRelationFilter | undefined;

  @TypeGraphQL.Field(_type => PositionFrameRelationFilter, {
    nullable: true
  })
  frame?: PositionFrameRelationFilter | undefined;
}
