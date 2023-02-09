import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartType } from "../../enums/PartType";

@TypeGraphQL.InputType("EnumPartTypeFieldUpdateOperationsInput", {
  isAbstract: true
})
export class EnumPartTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => PartType, {
    nullable: true
  })
  set?: "LED" | "FIBER" | undefined;
}
