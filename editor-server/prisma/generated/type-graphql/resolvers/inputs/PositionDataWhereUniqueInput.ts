import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataDancerIdFrameIdCompoundUniqueInput } from "../inputs/PositionDataDancerIdFrameIdCompoundUniqueInput";

@TypeGraphQL.InputType("PositionDataWhereUniqueInput", {
  isAbstract: true
})
export class PositionDataWhereUniqueInput {
  @TypeGraphQL.Field(_type => PositionDataDancerIdFrameIdCompoundUniqueInput, {
    nullable: true
  })
  dancerId_frameId?: PositionDataDancerIdFrameIdCompoundUniqueInput | undefined;
}
