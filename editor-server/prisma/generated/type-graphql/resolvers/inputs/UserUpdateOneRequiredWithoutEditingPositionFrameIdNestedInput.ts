import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateOrConnectWithoutEditingPositionFrameIdInput";
import { UserCreateWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateWithoutEditingPositionFrameIdInput";
import { UserUpdateWithoutEditingPositionFrameIdInput } from "../inputs/UserUpdateWithoutEditingPositionFrameIdInput";
import { UserUpsertWithoutEditingPositionFrameIdInput } from "../inputs/UserUpsertWithoutEditingPositionFrameIdInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput", {
  isAbstract: true
})
export class UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutEditingPositionFrameIdInput, {
    nullable: true
  })
  create?: UserCreateWithoutEditingPositionFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutEditingPositionFrameIdInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutEditingPositionFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserUpsertWithoutEditingPositionFrameIdInput, {
    nullable: true
  })
  upsert?: UserUpsertWithoutEditingPositionFrameIdInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => UserUpdateWithoutEditingPositionFrameIdInput, {
    nullable: true
  })
  update?: UserUpdateWithoutEditingPositionFrameIdInput | undefined;
}
