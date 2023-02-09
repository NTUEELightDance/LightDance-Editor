import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataUpdateWithoutPartInput } from "../inputs/ControlDataUpdateWithoutPartInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpdateWithWhereUniqueWithoutPartInput", {
  isAbstract: true
})
export class ControlDataUpdateWithWhereUniqueWithoutPartInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateWithoutPartInput, {
    nullable: false
  })
  data!: ControlDataUpdateWithoutPartInput;
}
