import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EffectListDataUpdatecontrolFramesInput } from "../inputs/EffectListDataUpdatecontrolFramesInput";
import { EffectListDataUpdatedancerDataInput } from "../inputs/EffectListDataUpdatedancerDataInput";
import { EffectListDataUpdatepositionFramesInput } from "../inputs/EffectListDataUpdatepositionFramesInput";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";
import { NullableStringFieldUpdateOperationsInput } from "../inputs/NullableStringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("EffectListDataUpdateInput", {
  isAbstract: true
})
export class EffectListDataUpdateInput {
  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  start?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  end?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  description?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataUpdatedancerDataInput, {
    nullable: true
  })
  dancerData?: EffectListDataUpdatedancerDataInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataUpdatecontrolFramesInput, {
    nullable: true
  })
  controlFrames?: EffectListDataUpdatecontrolFramesInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataUpdatepositionFramesInput, {
    nullable: true
  })
  positionFrames?: EffectListDataUpdatepositionFramesInput | undefined;
}
