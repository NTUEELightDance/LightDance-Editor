import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateWithoutUserInput } from "../inputs/EditingPositionFrameCreateWithoutUserInput";
import { EditingPositionFrameUpdateWithoutUserInput } from "../inputs/EditingPositionFrameUpdateWithoutUserInput";

@TypeGraphQL.InputType("EditingPositionFrameUpsertWithoutUserInput", {
  isAbstract: true
})
export class EditingPositionFrameUpsertWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateWithoutUserInput, {
    nullable: false
  })
  update!: EditingPositionFrameUpdateWithoutUserInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutUserInput, {
    nullable: false
  })
  create!: EditingPositionFrameCreateWithoutUserInput;
}
