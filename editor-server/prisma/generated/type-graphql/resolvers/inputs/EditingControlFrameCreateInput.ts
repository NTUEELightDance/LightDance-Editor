import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateNestedOneWithoutEditingInput } from "../inputs/ControlFrameCreateNestedOneWithoutEditingInput";
import { UserCreateNestedOneWithoutEditingControlFrameIdInput } from "../inputs/UserCreateNestedOneWithoutEditingControlFrameIdInput";

@TypeGraphQL.InputType("EditingControlFrameCreateInput", {
  isAbstract: true
})
export class EditingControlFrameCreateInput {
  @TypeGraphQL.Field(_type => UserCreateNestedOneWithoutEditingControlFrameIdInput, {
    nullable: false
  })
  user!: UserCreateNestedOneWithoutEditingControlFrameIdInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateNestedOneWithoutEditingInput, {
    nullable: true
  })
  editingFrame?: ControlFrameCreateNestedOneWithoutEditingInput | undefined;
}
