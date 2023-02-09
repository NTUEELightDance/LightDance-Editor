import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateOrConnectWithoutUserInput } from "../inputs/EditingControlFrameCreateOrConnectWithoutUserInput";
import { EditingControlFrameCreateWithoutUserInput } from "../inputs/EditingControlFrameCreateWithoutUserInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameCreateNestedOneWithoutUserInput", {
  isAbstract: true
})
export class EditingControlFrameCreateNestedOneWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutUserInput, {
    nullable: true
  })
  create?: EditingControlFrameCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateOrConnectWithoutUserInput, {
    nullable: true
  })
  connectOrCreate?: EditingControlFrameCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingControlFrameWhereUniqueInput | undefined;
}
