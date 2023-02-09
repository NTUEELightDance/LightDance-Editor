import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateNestedOneWithoutEditingControlFrameIdInput } from "../inputs/UserCreateNestedOneWithoutEditingControlFrameIdInput";

@TypeGraphQL.InputType("EditingControlFrameCreateWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingControlFrameCreateWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => UserCreateNestedOneWithoutEditingControlFrameIdInput, {
    nullable: false
  })
  user!: UserCreateNestedOneWithoutEditingControlFrameIdInput;
}
