import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateWithoutEditingPositionFrameIdInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserCreateOrConnectWithoutEditingPositionFrameIdInput", {
  isAbstract: true
})
export class UserCreateOrConnectWithoutEditingPositionFrameIdInput {
  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: false
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutEditingPositionFrameIdInput, {
    nullable: false
  })
  create!: UserCreateWithoutEditingPositionFrameIdInput;
}
