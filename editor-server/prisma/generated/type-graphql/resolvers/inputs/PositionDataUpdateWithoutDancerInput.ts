import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FloatFieldUpdateOperationsInput } from "../inputs/FloatFieldUpdateOperationsInput";
import { PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput } from "../inputs/PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput";

@TypeGraphQL.InputType("PositionDataUpdateWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataUpdateWithoutDancerInput {
  @TypeGraphQL.Field(_type => FloatFieldUpdateOperationsInput, {
    nullable: true
  })
  x?: FloatFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => FloatFieldUpdateOperationsInput, {
    nullable: true
  })
  y?: FloatFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => FloatFieldUpdateOperationsInput, {
    nullable: true
  })
  z?: FloatFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput, {
    nullable: true
  })
  frame?: PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput | undefined;
}
