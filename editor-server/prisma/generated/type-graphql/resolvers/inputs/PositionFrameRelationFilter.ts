import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameWhereInput } from "../inputs/PositionFrameWhereInput";

@TypeGraphQL.InputType("PositionFrameRelationFilter", {
  isAbstract: true
})
export class PositionFrameRelationFilter {
  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  is?: PositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  isNot?: PositionFrameWhereInput | undefined;
}
