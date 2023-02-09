import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateNestedOneWithoutUserInput } from "../inputs/EditingControlFrameCreateNestedOneWithoutUserInput";
import { EditingPositionFrameCreateNestedOneWithoutUserInput } from "../inputs/EditingPositionFrameCreateNestedOneWithoutUserInput";

@TypeGraphQL.InputType("UserCreateInput", {
  isAbstract: true
})
export class UserCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  password!: string;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateNestedOneWithoutUserInput, {
    nullable: true
  })
  editingPositionFrameId?: EditingPositionFrameCreateNestedOneWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateNestedOneWithoutUserInput, {
    nullable: true
  })
  editingControlFrameId?: EditingControlFrameCreateNestedOneWithoutUserInput | undefined;
}
