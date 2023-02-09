import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateWithoutFrameInput } from "../inputs/ControlDataCreateWithoutFrameInput";
import { ControlDataUpdateWithoutFrameInput } from "../inputs/ControlDataUpdateWithoutFrameInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpsertWithWhereUniqueWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataUpsertWithWhereUniqueWithoutFrameInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateWithoutFrameInput, {
    nullable: false
  })
  update!: ControlDataUpdateWithoutFrameInput;

  @TypeGraphQL.Field(_type => ControlDataCreateWithoutFrameInput, {
    nullable: false
  })
  create!: ControlDataCreateWithoutFrameInput;
}
