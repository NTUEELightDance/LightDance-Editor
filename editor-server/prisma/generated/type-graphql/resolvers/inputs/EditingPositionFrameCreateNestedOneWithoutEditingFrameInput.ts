import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateOrConnectWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateOrConnectWithoutEditingFrameInput";
import { EditingPositionFrameCreateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateWithoutEditingFrameInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateNestedOneWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateNestedOneWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutEditingFrameInput, {
    nullable: true
  })
  create?: EditingPositionFrameCreateWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateOrConnectWithoutEditingFrameInput, {
    nullable: true
  })
  connectOrCreate?: EditingPositionFrameCreateOrConnectWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingPositionFrameWhereUniqueInput | undefined;
}
