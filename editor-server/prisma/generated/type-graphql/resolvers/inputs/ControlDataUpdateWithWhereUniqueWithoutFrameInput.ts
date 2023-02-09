import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataUpdateWithoutFrameInput } from "../inputs/ControlDataUpdateWithoutFrameInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpdateWithWhereUniqueWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataUpdateWithWhereUniqueWithoutFrameInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateWithoutFrameInput, {
    nullable: false
  })
  data!: ControlDataUpdateWithoutFrameInput;
}
