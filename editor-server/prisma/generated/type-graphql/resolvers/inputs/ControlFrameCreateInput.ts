import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateNestedManyWithoutFrameInput } from "../inputs/ControlDataCreateNestedManyWithoutFrameInput";
import { EditingControlFrameCreateNestedOneWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateNestedOneWithoutEditingFrameInput";

@TypeGraphQL.InputType("ControlFrameCreateInput", {
  isAbstract: true
})
export class ControlFrameCreateInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  fade!: boolean;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateNestedOneWithoutEditingFrameInput, {
    nullable: true
  })
  editing?: EditingControlFrameCreateNestedOneWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataCreateNestedManyWithoutFrameInput, {
    nullable: true
  })
  controlDatas?: ControlDataCreateNestedManyWithoutFrameInput | undefined;
}
