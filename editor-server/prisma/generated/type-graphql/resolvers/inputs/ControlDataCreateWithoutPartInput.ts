import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateNestedOneWithoutControlDatasInput } from "../inputs/ControlFrameCreateNestedOneWithoutControlDatasInput";

@TypeGraphQL.InputType("ControlDataCreateWithoutPartInput", {
  isAbstract: true
})
export class ControlDataCreateWithoutPartInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  value!: Prisma.InputJsonValue;

  @TypeGraphQL.Field(_type => ControlFrameCreateNestedOneWithoutControlDatasInput, {
    nullable: false
  })
  frame!: ControlFrameCreateNestedOneWithoutControlDatasInput;
}
