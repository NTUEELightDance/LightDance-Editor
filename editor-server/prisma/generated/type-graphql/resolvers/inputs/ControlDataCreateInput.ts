import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateNestedOneWithoutControlDatasInput } from "../inputs/ControlFrameCreateNestedOneWithoutControlDatasInput";
import { PartCreateNestedOneWithoutControlDataInput } from "../inputs/PartCreateNestedOneWithoutControlDataInput";

@TypeGraphQL.InputType("ControlDataCreateInput", {
  isAbstract: true
})
export class ControlDataCreateInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  value!: Prisma.InputJsonValue;

  @TypeGraphQL.Field(_type => PartCreateNestedOneWithoutControlDataInput, {
    nullable: false
  })
  part!: PartCreateNestedOneWithoutControlDataInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateNestedOneWithoutControlDatasInput, {
    nullable: false
  })
  frame!: ControlFrameCreateNestedOneWithoutControlDatasInput;
}
