import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutEditingControlFrameIdInput } from "../inputs/UserCreateWithoutEditingControlFrameIdInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserCreateOrConnectWithoutEditingControlFrameIdInput", {
  isAbstract: true
})
export class UserCreateOrConnectWithoutEditingControlFrameIdInput {
  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: false
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutEditingControlFrameIdInput, {
    nullable: false
  })
  create!: UserCreateWithoutEditingControlFrameIdInput;
}
