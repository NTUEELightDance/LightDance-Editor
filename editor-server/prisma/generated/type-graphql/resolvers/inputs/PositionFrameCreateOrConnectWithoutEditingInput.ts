import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateWithoutEditingInput } from "../inputs/PositionFrameCreateWithoutEditingInput";
import { PositionFrameWhereUniqueInput } from "../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("PositionFrameCreateOrConnectWithoutEditingInput", {
  isAbstract: true
})
export class PositionFrameCreateOrConnectWithoutEditingInput {
  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: PositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutEditingInput, {
    nullable: false
  })
  create!: PositionFrameCreateWithoutEditingInput;
}
