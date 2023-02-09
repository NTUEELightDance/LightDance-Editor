import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateWithoutEditingFrameInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameCreateOrConnectWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingControlFrameCreateOrConnectWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutEditingFrameInput, {
    nullable: false
  })
  create!: EditingControlFrameCreateWithoutEditingFrameInput;
}
