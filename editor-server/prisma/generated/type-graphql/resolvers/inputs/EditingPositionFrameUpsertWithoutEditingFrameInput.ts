import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateWithoutEditingFrameInput";
import { EditingPositionFrameUpdateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameUpdateWithoutEditingFrameInput";

@TypeGraphQL.InputType("EditingPositionFrameUpsertWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingPositionFrameUpsertWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateWithoutEditingFrameInput, {
    nullable: false
  })
  update!: EditingPositionFrameUpdateWithoutEditingFrameInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutEditingFrameInput, {
    nullable: false
  })
  create!: EditingPositionFrameCreateWithoutEditingFrameInput;
}
