import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartUpdateOneRequiredWithoutControlDataNestedInput } from "../inputs/PartUpdateOneRequiredWithoutControlDataNestedInput";

@TypeGraphQL.InputType("ControlDataUpdateWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataUpdateWithoutFrameInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  value?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => PartUpdateOneRequiredWithoutControlDataNestedInput, {
    nullable: true
  })
  part?: PartUpdateOneRequiredWithoutControlDataNestedInput | undefined;
}
