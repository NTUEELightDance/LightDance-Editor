import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartUpdateManyWithoutDancerNestedInput } from "../inputs/PartUpdateManyWithoutDancerNestedInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("DancerUpdateWithoutPositionDataInput", {
  isAbstract: true
})
export class DancerUpdateWithoutPositionDataInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => PartUpdateManyWithoutDancerNestedInput, {
    nullable: true
  })
  parts?: PartUpdateManyWithoutDancerNestedInput | undefined;
}
