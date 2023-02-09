import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateNestedManyWithoutFrameInput } from "../inputs/PositionDataCreateNestedManyWithoutFrameInput";

@TypeGraphQL.InputType("PositionFrameCreateWithoutEditingInput", {
  isAbstract: true
})
export class PositionFrameCreateWithoutEditingInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => PositionDataCreateNestedManyWithoutFrameInput, {
    nullable: true
  })
  positionDatas?: PositionDataCreateNestedManyWithoutFrameInput | undefined;
}
