import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameUpdateOneWithoutEditingNestedInput } from "../inputs/ControlFrameUpdateOneWithoutEditingNestedInput";

@TypeGraphQL.InputType("EditingControlFrameUpdateWithoutUserInput", {
  isAbstract: true
})
export class EditingControlFrameUpdateWithoutUserInput {
  @TypeGraphQL.Field(_type => ControlFrameUpdateOneWithoutEditingNestedInput, {
    nullable: true
  })
  editingFrame?: ControlFrameUpdateOneWithoutEditingNestedInput | undefined;
}
