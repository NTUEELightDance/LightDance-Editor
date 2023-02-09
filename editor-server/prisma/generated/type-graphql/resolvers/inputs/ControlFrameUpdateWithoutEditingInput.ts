import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolFieldUpdateOperationsInput } from "../inputs/BoolFieldUpdateOperationsInput";
import { ControlDataUpdateManyWithoutFrameNestedInput } from "../inputs/ControlDataUpdateManyWithoutFrameNestedInput";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";

@TypeGraphQL.InputType("ControlFrameUpdateWithoutEditingInput", {
  isAbstract: true
})
export class ControlFrameUpdateWithoutEditingInput {
  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  start?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => BoolFieldUpdateOperationsInput, {
    nullable: true
  })
  fade?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataUpdateManyWithoutFrameNestedInput, {
    nullable: true
  })
  controlDatas?: ControlDataUpdateManyWithoutFrameNestedInput | undefined;
}
