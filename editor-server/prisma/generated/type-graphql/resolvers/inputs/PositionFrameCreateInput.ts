import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateNestedOneWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateNestedOneWithoutEditingFrameInput";
import { PositionDataCreateNestedManyWithoutFrameInput } from "../inputs/PositionDataCreateNestedManyWithoutFrameInput";

@TypeGraphQL.InputType("PositionFrameCreateInput", {
  isAbstract: true
})
export class PositionFrameCreateInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateNestedOneWithoutEditingFrameInput, {
    nullable: true
  })
  editing?: EditingPositionFrameCreateNestedOneWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateNestedManyWithoutFrameInput, {
    nullable: true
  })
  positionDatas?: PositionDataCreateNestedManyWithoutFrameInput | undefined;
}
