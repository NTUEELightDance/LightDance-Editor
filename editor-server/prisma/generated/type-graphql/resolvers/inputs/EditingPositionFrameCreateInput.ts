import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateNestedOneWithoutEditingInput } from "../inputs/PositionFrameCreateNestedOneWithoutEditingInput";
import { UserCreateNestedOneWithoutEditingPositionFrameIdInput } from "../inputs/UserCreateNestedOneWithoutEditingPositionFrameIdInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateInput {
  @TypeGraphQL.Field(_type => UserCreateNestedOneWithoutEditingPositionFrameIdInput, {
    nullable: false
  })
  user!: UserCreateNestedOneWithoutEditingPositionFrameIdInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateNestedOneWithoutEditingInput, {
    nullable: true
  })
  editingFrame?: PositionFrameCreateNestedOneWithoutEditingInput | undefined;
}
