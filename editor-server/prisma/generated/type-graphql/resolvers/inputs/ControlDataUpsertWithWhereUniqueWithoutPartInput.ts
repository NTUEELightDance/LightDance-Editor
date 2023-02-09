import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateWithoutPartInput } from "../inputs/ControlDataCreateWithoutPartInput";
import { ControlDataUpdateWithoutPartInput } from "../inputs/ControlDataUpdateWithoutPartInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpsertWithWhereUniqueWithoutPartInput", {
  isAbstract: true
})
export class ControlDataUpsertWithWhereUniqueWithoutPartInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateWithoutPartInput, {
    nullable: false
  })
  update!: ControlDataUpdateWithoutPartInput;

  @TypeGraphQL.Field(_type => ControlDataCreateWithoutPartInput, {
    nullable: false
  })
  create!: ControlDataCreateWithoutPartInput;
}
