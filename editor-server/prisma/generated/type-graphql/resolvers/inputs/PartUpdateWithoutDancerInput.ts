import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataUpdateManyWithoutPartNestedInput } from "../inputs/ControlDataUpdateManyWithoutPartNestedInput";
import { EnumPartTypeFieldUpdateOperationsInput } from "../inputs/EnumPartTypeFieldUpdateOperationsInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("PartUpdateWithoutDancerInput", {
  isAbstract: true
})
export class PartUpdateWithoutDancerInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EnumPartTypeFieldUpdateOperationsInput, {
    nullable: true
  })
  type?: EnumPartTypeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataUpdateManyWithoutPartNestedInput, {
    nullable: true
  })
  controlData?: ControlDataUpdateManyWithoutPartNestedInput | undefined;
}
