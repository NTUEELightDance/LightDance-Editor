import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput } from "../inputs/UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput";

@TypeGraphQL.InputType("EditingPositionFrameUpdateWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingPositionFrameUpdateWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput, {
    nullable: true
  })
  user?: UserUpdateOneRequiredWithoutEditingPositionFrameIdNestedInput | undefined;
}
