import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EnumPartTypeFieldUpdateOperationsInput } from "../inputs/EnumPartTypeFieldUpdateOperationsInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("PartUpdateManyMutationInput", {
  isAbstract: true
})
export class PartUpdateManyMutationInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EnumPartTypeFieldUpdateOperationsInput, {
    nullable: true
  })
  type?: EnumPartTypeFieldUpdateOperationsInput | undefined;
}
