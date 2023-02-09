import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameWhereInput } from "../inputs/EditingPositionFrameWhereInput";

@TypeGraphQL.InputType("EditingPositionFrameRelationFilter", {
  isAbstract: true
})
export class EditingPositionFrameRelationFilter {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  is?: EditingPositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  isNot?: EditingPositionFrameWhereInput | undefined;
}
