import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameWhereInput } from "../inputs/ControlFrameWhereInput";

@TypeGraphQL.InputType("ControlFrameRelationFilter", {
  isAbstract: true
})
export class ControlFrameRelationFilter {
  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  is?: ControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  isNot?: ControlFrameWhereInput | undefined;
}
