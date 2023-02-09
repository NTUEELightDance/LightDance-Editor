import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateNestedOneWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateNestedOneWithoutEditingFrameInput";

@TypeGraphQL.InputType("PositionFrameCreateWithoutPositionDatasInput", {
  isAbstract: true
})
export class PositionFrameCreateWithoutPositionDatasInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateNestedOneWithoutEditingFrameInput, {
    nullable: true
  })
  editing?: EditingPositionFrameCreateNestedOneWithoutEditingFrameInput | undefined;
}
