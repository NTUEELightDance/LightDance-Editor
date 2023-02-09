import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutEditingControlFrameIdInput } from "../inputs/UserCreateWithoutEditingControlFrameIdInput";
import { UserUpdateWithoutEditingControlFrameIdInput } from "../inputs/UserUpdateWithoutEditingControlFrameIdInput";

@TypeGraphQL.InputType("UserUpsertWithoutEditingControlFrameIdInput", {
  isAbstract: true
})
export class UserUpsertWithoutEditingControlFrameIdInput {
  @TypeGraphQL.Field(_type => UserUpdateWithoutEditingControlFrameIdInput, {
    nullable: false
  })
  update!: UserUpdateWithoutEditingControlFrameIdInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutEditingControlFrameIdInput, {
    nullable: false
  })
  create!: UserCreateWithoutEditingControlFrameIdInput;
}
