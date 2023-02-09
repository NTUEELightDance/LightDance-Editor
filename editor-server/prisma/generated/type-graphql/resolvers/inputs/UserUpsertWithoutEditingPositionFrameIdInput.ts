import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateWithoutEditingPositionFrameIdInput";
import { UserUpdateWithoutEditingPositionFrameIdInput } from "../inputs/UserUpdateWithoutEditingPositionFrameIdInput";

@TypeGraphQL.InputType("UserUpsertWithoutEditingPositionFrameIdInput", {
  isAbstract: true
})
export class UserUpsertWithoutEditingPositionFrameIdInput {
  @TypeGraphQL.Field(_type => UserUpdateWithoutEditingPositionFrameIdInput, {
    nullable: false
  })
  update!: UserUpdateWithoutEditingPositionFrameIdInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutEditingPositionFrameIdInput, {
    nullable: false
  })
  create!: UserCreateWithoutEditingPositionFrameIdInput;
}
