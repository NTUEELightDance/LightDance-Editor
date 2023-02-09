import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataPartIdFrameIdCompoundUniqueInput } from "../inputs/ControlDataPartIdFrameIdCompoundUniqueInput";

@TypeGraphQL.InputType("ControlDataWhereUniqueInput", {
  isAbstract: true
})
export class ControlDataWhereUniqueInput {
  @TypeGraphQL.Field(_type => ControlDataPartIdFrameIdCompoundUniqueInput, {
    nullable: true
  })
  partId_frameId?: ControlDataPartIdFrameIdCompoundUniqueInput | undefined;
}
