import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameUpdateOneWithoutUserNestedInput } from "../inputs/EditingControlFrameUpdateOneWithoutUserNestedInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("UserUpdateWithoutEditingPositionFrameIdInput", {
  isAbstract: true
})
export class UserUpdateWithoutEditingPositionFrameIdInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  password?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameUpdateOneWithoutUserNestedInput, {
    nullable: true
  })
  editingControlFrameId?: EditingControlFrameUpdateOneWithoutUserNestedInput | undefined;
}
