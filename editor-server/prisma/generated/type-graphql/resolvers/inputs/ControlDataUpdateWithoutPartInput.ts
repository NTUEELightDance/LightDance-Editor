import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput } from "../inputs/ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput";

@TypeGraphQL.InputType("ControlDataUpdateWithoutPartInput", {
  isAbstract: true
})
export class ControlDataUpdateWithoutPartInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  value?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput, {
    nullable: true
  })
  frame?: ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput | undefined;
}
