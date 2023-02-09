import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolFieldUpdateOperationsInput } from "../inputs/BoolFieldUpdateOperationsInput";
import { EditingControlFrameUpdateOneWithoutEditingFrameNestedInput } from "../inputs/EditingControlFrameUpdateOneWithoutEditingFrameNestedInput";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";

@TypeGraphQL.InputType("ControlFrameUpdateWithoutControlDatasInput", {
  isAbstract: true
})
export class ControlFrameUpdateWithoutControlDatasInput {
  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  start?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => BoolFieldUpdateOperationsInput, {
    nullable: true
  })
  fade?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameUpdateOneWithoutEditingFrameNestedInput, {
    nullable: true
  })
  editing?: EditingControlFrameUpdateOneWithoutEditingFrameNestedInput | undefined;
}
