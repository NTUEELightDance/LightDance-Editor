import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateWithoutFrameInput } from "../inputs/ControlDataCreateWithoutFrameInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataCreateOrConnectWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataCreateOrConnectWithoutFrameInput {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataCreateWithoutFrameInput, {
    nullable: false
  })
  create!: ControlDataCreateWithoutFrameInput;
}
