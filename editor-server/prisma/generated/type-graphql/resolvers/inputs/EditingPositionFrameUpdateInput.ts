import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameUpdateOneWithoutEditingNestedInput } from "../inputs/PositionFrameUpdateOneWithoutEditingNestedInput";
import { UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput } from "../inputs/UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput";

@TypeGraphQL.InputType("EditingPositionFrameUpdateInput", {
  isAbstract: true
})
export class EditingPositionFrameUpdateInput {
  @TypeGraphQL.Field(_type => UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput, {
    nullable: true
  })
  user?: UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpdateOneWithoutEditingNestedInput, {
    nullable: true
  })
  editingFrame?: PositionFrameUpdateOneWithoutEditingNestedInput | undefined;
}
