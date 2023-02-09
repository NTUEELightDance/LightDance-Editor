import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerUpdateOneRequiredWithoutPositionDataNestedInput } from "../inputs/DancerUpdateOneRequiredWithoutPositionDataNestedInput";
import { FloatFieldUpdateOperationsInput } from "../inputs/FloatFieldUpdateOperationsInput";

@TypeGraphQL.InputType("PositionDataUpdateWithoutFrameInput", {
  isAbstract: true
})
export class PositionDataUpdateWithoutFrameInput {
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

  @TypeGraphQL.Field(_type => DancerUpdateOneRequiredWithoutPositionDataNestedInput, {
    nullable: true
  })
  dancer?: DancerUpdateOneRequiredWithoutPositionDataNestedInput | undefined;
}
