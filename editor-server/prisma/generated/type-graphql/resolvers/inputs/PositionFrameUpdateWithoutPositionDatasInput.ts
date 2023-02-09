import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput } from "../inputs/EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";

@TypeGraphQL.InputType("PositionFrameUpdateWithoutPositionDatasInput", {
  isAbstract: true
})
export class PositionFrameUpdateWithoutPositionDatasInput {
  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  start?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput, {
    nullable: true
  })
  editing?: EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput | undefined;
}
