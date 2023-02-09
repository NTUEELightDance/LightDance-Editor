import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateNestedOneWithoutControlDataInput } from "../inputs/PartCreateNestedOneWithoutControlDataInput";

@TypeGraphQL.InputType("ControlDataCreateWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataCreateWithoutFrameInput {
  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  value!: Prisma.InputJsonValue;

  @TypeGraphQL.Field(_type => PartCreateNestedOneWithoutControlDataInput, {
    nullable: false
  })
  part!: PartCreateNestedOneWithoutControlDataInput;
}
