import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateWithoutUserInput } from "../inputs/EditingControlFrameCreateWithoutUserInput";
import { EditingControlFrameUpdateWithoutUserInput } from "../inputs/EditingControlFrameUpdateWithoutUserInput";

@TypeGraphQL.InputType("EditingControlFrameUpsertWithoutUserInput", {
  isAbstract: true
})
export class EditingControlFrameUpsertWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingControlFrameUpdateWithoutUserInput, {
    nullable: false
  })
  update!: EditingControlFrameUpdateWithoutUserInput;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutUserInput, {
    nullable: false
  })
  create!: EditingControlFrameCreateWithoutUserInput;
}
