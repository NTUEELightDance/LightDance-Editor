import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameWhereInput } from "../inputs/EditingControlFrameWhereInput";

@TypeGraphQL.InputType("EditingControlFrameRelationFilter", {
  isAbstract: true
})
export class EditingControlFrameRelationFilter {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  is?: EditingControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  isNot?: EditingControlFrameWhereInput | undefined;
}
