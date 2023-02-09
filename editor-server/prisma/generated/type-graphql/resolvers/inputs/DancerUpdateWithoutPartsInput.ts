import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataUpdateManyWithoutDancerNestedInput } from "../inputs/PositionDataUpdateManyWithoutDancerNestedInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("DancerUpdateWithoutPartsInput", {
  isAbstract: true
})
export class DancerUpdateWithoutPartsInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataUpdateManyWithoutDancerNestedInput, {
    nullable: true
  })
  positionData?: PositionDataUpdateManyWithoutDancerNestedInput | undefined;
}
