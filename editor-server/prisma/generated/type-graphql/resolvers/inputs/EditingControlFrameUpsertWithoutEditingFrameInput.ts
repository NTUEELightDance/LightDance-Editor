import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateWithoutEditingFrameInput";
import { EditingControlFrameUpdateWithoutEditingFrameInput } from "../inputs/EditingControlFrameUpdateWithoutEditingFrameInput";

@TypeGraphQL.InputType("EditingControlFrameUpsertWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingControlFrameUpsertWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingControlFrameUpdateWithoutEditingFrameInput, {
    nullable: false
  })
  update!: EditingControlFrameUpdateWithoutEditingFrameInput;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutEditingFrameInput, {
    nullable: false
  })
  create!: EditingControlFrameCreateWithoutEditingFrameInput;
}
