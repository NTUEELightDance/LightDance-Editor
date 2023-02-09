import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateNestedOneWithoutEditingInput } from "../inputs/PositionFrameCreateNestedOneWithoutEditingInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateWithoutUserInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateWithoutUserInput {
  @TypeGraphQL.Field(_type => PositionFrameCreateNestedOneWithoutEditingInput, {
    nullable: true
  })
  editingFrame?: PositionFrameCreateNestedOneWithoutEditingInput | undefined;
}
