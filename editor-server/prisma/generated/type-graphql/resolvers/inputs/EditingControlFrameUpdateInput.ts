import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameUpdateOneWithoutEditingNestedInput } from "../inputs/ControlFrameUpdateOneWithoutEditingNestedInput";
import { UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput } from "../inputs/UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput";

@TypeGraphQL.InputType("EditingControlFrameUpdateInput", {
  isAbstract: true
})
export class EditingControlFrameUpdateInput {
  @TypeGraphQL.Field(_type => UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput, {
    nullable: true
  })
  user?: UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpdateOneWithoutEditingNestedInput, {
    nullable: true
  })
  editingFrame?: ControlFrameUpdateOneWithoutEditingNestedInput | undefined;
}
