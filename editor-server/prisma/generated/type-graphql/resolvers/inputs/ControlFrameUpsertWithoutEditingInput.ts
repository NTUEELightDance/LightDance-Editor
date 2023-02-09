import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateWithoutEditingInput } from "../inputs/ControlFrameCreateWithoutEditingInput";
import { ControlFrameUpdateWithoutEditingInput } from "../inputs/ControlFrameUpdateWithoutEditingInput";

@TypeGraphQL.InputType("ControlFrameUpsertWithoutEditingInput", {
  isAbstract: true
})
export class ControlFrameUpsertWithoutEditingInput {
  @TypeGraphQL.Field(_type => ControlFrameUpdateWithoutEditingInput, {
    nullable: false
  })
  update!: ControlFrameUpdateWithoutEditingInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutEditingInput, {
    nullable: false
  })
  create!: ControlFrameCreateWithoutEditingInput;
}
