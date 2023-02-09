import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutEditingControlFrameIdInput } from "../inputs/UserCreateOrConnectWithoutEditingControlFrameIdInput";
import { UserCreateWithoutEditingControlFrameIdInput } from "../inputs/UserCreateWithoutEditingControlFrameIdInput";
import { UserUpdateWithoutEditingControlFrameIdInput } from "../inputs/UserUpdateWithoutEditingControlFrameIdInput";
import { UserUpsertWithoutEditingControlFrameIdInput } from "../inputs/UserUpsertWithoutEditingControlFrameIdInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput", {
  isAbstract: true
})
export class UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  create?: UserCreateWithoutEditingControlFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutEditingControlFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserUpsertWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  upsert?: UserUpsertWithoutEditingControlFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => UserUpdateWithoutEditingControlFrameIdInput, {
    nullable: true
  })
  update?: UserUpdateWithoutEditingControlFrameIdInput | undefined;
}
