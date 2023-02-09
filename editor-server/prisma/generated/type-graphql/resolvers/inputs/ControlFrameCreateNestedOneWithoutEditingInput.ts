import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateOrConnectWithoutEditingInput } from "../inputs/ControlFrameCreateOrConnectWithoutEditingInput";
import { ControlFrameCreateWithoutEditingInput } from "../inputs/ControlFrameCreateWithoutEditingInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameCreateNestedOneWithoutEditingInput", {
  isAbstract: true
})
export class ControlFrameCreateNestedOneWithoutEditingInput {
  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutEditingInput, {
    nullable: true
  })
  create?: ControlFrameCreateWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameCreateOrConnectWithoutEditingInput, {
    nullable: true
  })
  connectOrCreate?: ControlFrameCreateOrConnectWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: ControlFrameWhereUniqueInput | undefined;
}
