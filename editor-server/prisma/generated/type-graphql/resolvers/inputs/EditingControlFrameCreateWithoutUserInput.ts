import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateNestedOneWithoutEditingInput } from "../inputs/ControlFrameCreateNestedOneWithoutEditingInput";

@TypeGraphQL.InputType("EditingControlFrameCreateWithoutUserInput", {
  isAbstract: true
})
export class EditingControlFrameCreateWithoutUserInput {
  @TypeGraphQL.Field(_type => ControlFrameCreateNestedOneWithoutEditingInput, {
    nullable: true
  })
  editingFrame?: ControlFrameCreateNestedOneWithoutEditingInput | undefined;
}
