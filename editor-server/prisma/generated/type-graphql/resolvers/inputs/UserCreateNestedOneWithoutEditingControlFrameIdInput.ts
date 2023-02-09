import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutEditingControlFrameIdInput } from "../inputs/UserCreateOrConnectWithoutEditingControlFrameIdInput";
import { UserCreateWithoutEditingControlFrameIdInput } from "../inputs/UserCreateWithoutEditingControlFrameIdInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserCreateNestedOneWithoutEditingControlFrameIdInput", {
  isAbstract: true
})
export class UserCreateNestedOneWithoutEditingControlFrameIdInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  create?: UserCreateWithoutEditingControlFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutEditingControlFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;
}
