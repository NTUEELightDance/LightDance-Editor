import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateNestedOneWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateNestedOneWithoutEditingFrameInput";

@TypeGraphQL.InputType("ControlFrameCreateWithoutControlDatasInput", {
  isAbstract: true
})
export class ControlFrameCreateWithoutControlDatasInput {
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
}
