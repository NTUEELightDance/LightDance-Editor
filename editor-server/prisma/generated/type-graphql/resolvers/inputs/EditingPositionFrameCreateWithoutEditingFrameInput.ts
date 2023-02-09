import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateNestedOneWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateNestedOneWithoutEditingPositionFrameIdInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => UserCreateNestedOneWithoutEditingPositionFrameIdInput, {
    nullable: false
  })
  user!: UserCreateNestedOneWithoutEditingPositionFrameIdInput;
}
