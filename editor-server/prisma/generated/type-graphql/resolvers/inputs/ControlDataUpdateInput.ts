import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput } from "../inputs/ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput";
import { PartUpdateOneRequiredWithoutControlDataNestedInput } from "../inputs/PartUpdateOneRequiredWithoutControlDataNestedInput";

@TypeGraphQL.InputType("ControlDataUpdateInput", {
  isAbstract: true
})
export class ControlDataUpdateInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  value?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => PartUpdateOneRequiredWithoutControlDataNestedInput, {
    nullable: true
  })
  part?: PartUpdateOneRequiredWithoutControlDataNestedInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput, {
    nullable: true
  })
  frame?: ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput | undefined;
}
