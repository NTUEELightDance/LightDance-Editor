import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput } from "../inputs/UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput";

@TypeGraphQL.InputType("EditingControlFrameUpdateWithoutEditingFrameInput", {
  isAbstract: true
})
export class EditingControlFrameUpdateWithoutEditingFrameInput {
  @TypeGraphQL.Field(_type => UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput, {
    nullable: true
  })
  user?: UserUpdateOneRequiredWithoutEditingControlFrameIdNestedInput | undefined;
}
