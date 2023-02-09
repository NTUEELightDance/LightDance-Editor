import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";
import { PositionDataUpdateManyWithoutFrameNestedInput } from "../inputs/PositionDataUpdateManyWithoutFrameNestedInput";

@TypeGraphQL.InputType("PositionFrameUpdateWithoutEditingInput", {
  isAbstract: true
})
export class PositionFrameUpdateWithoutEditingInput {
  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  start?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataUpdateManyWithoutFrameNestedInput, {
    nullable: true
  })
  positionDatas?: PositionDataUpdateManyWithoutFrameNestedInput | undefined;
}
