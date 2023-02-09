import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateWithoutEditingFrameInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateOrConnectWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateOrConnectWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingPositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutEditingFrameInput, {
    nullable: false
  })
  create!: EditingPositionFrameCreateWithoutEditingFrameInput;
}
