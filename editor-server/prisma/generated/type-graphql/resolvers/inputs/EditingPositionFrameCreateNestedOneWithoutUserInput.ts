import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateOrConnectWithoutUserInput } from "../inputs/EditingPositionFrameCreateOrConnectWithoutUserInput";
import { EditingPositionFrameCreateWithoutUserInput } from "../inputs/EditingPositionFrameCreateWithoutUserInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateNestedOneWithoutUserInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateNestedOneWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutUserInput, {
    nullable: true
  })
  create?: EditingPositionFrameCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateOrConnectWithoutUserInput, {
    nullable: true
  })
  connectOrCreate?: EditingPositionFrameCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingPositionFrameWhereUniqueInput | undefined;
}
