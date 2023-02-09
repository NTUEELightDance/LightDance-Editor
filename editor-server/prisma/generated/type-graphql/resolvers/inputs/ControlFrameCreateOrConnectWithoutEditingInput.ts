import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateWithoutEditingInput } from "../inputs/ControlFrameCreateWithoutEditingInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameCreateOrConnectWithoutEditingInput", {
  isAbstract: true
})
export class ControlFrameCreateOrConnectWithoutEditingInput {
  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: ControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutEditingInput, {
    nullable: false
  })
  create!: ControlFrameCreateWithoutEditingInput;
}
