import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameUpdateOneWithoutUserNestedInput } from "../inputs/EditingPositionFrameUpdateOneWithoutUserNestedInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("UserUpdateWithoutEditingControlFrameIdInput", {
  isAbstract: true
})
export class UserUpdateWithoutEditingControlFrameIdInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  password?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateOneWithoutUserNestedInput, {
    nullable: true
  })
  editingPositionFrameId?: EditingPositionFrameUpdateOneWithoutUserNestedInput | undefined;
}
