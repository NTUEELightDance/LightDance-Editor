import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataScalarWhereInput } from "../inputs/ControlDataScalarWhereInput";
import { ControlDataUpdateManyMutationInput } from "../inputs/ControlDataUpdateManyMutationInput";

@TypeGraphQL.InputType("ControlDataUpdateManyWithWhereWithoutPartInput", {
  isAbstract: true
})
export class ControlDataUpdateManyWithWhereWithoutPartInput {
  @TypeGraphQL.Field(_type => ControlDataScalarWhereInput, {
    nullable: false
  })
  where!: ControlDataScalarWhereInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateManyMutationInput, {
    nullable: false
  })
  data!: ControlDataUpdateManyMutationInput;
}
