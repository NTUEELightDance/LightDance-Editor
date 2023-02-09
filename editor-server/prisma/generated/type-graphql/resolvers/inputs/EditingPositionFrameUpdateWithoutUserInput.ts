import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameUpdateOneWithoutEditingNestedInput } from "../inputs/PositionFrameUpdateOneWithoutEditingNestedInput";

@TypeGraphQL.InputType("EditingPositionFrameUpdateWithoutUserInput", {
  isAbstract: true
})
export class EditingPositionFrameUpdateWithoutUserInput {
  @TypeGraphQL.Field(_type => PositionFrameUpdateOneWithoutEditingNestedInput, {
    nullable: true
  })
  editingFrame?: PositionFrameUpdateOneWithoutEditingNestedInput | undefined;
}
