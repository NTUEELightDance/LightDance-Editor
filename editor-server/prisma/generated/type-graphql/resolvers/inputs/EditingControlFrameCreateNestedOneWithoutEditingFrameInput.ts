import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateOrConnectWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateOrConnectWithoutEditingFrameInput";
import { EditingControlFrameCreateWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateWithoutEditingFrameInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameCreateNestedOneWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingControlFrameCreateNestedOneWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutEditingFrameInput, {
    nullable: true
  })
  create?: EditingControlFrameCreateWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateOrConnectWithoutEditingFrameInput, {
    nullable: true
  })
  connectOrCreate?: EditingControlFrameCreateOrConnectWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingControlFrameWhereUniqueInput | undefined;
}
