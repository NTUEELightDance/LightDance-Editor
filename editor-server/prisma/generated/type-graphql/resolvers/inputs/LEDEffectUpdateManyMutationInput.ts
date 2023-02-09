import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";
import { LEDEffectUpdateframesInput } from "../inputs/LEDEffectUpdateframesInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("LEDEffectUpdateManyMutationInput", {
  isAbstract: true
})
export class LEDEffectUpdateManyMutationInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  partName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  repeat?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => LEDEffectUpdateframesInput, {
    nullable: true
  })
  frames?: LEDEffectUpdateframesInput | undefined;
}
