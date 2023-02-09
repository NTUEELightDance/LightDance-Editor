import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateWithoutPartInput } from "../inputs/ControlDataCreateWithoutPartInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataCreateOrConnectWithoutPartInput", {
  isAbstract: true
})
export class ControlDataCreateOrConnectWithoutPartInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataCreateWithoutPartInput, {
    nullable: false
  })
  create!: ControlDataCreateWithoutPartInput;
}
