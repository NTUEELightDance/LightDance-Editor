import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateWithoutControlDatasInput } from "../inputs/ControlFrameCreateWithoutControlDatasInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameCreateOrConnectWithoutControlDatasInput", {
  isAbstract: true
})
export class ControlFrameCreateOrConnectWithoutControlDatasInput {
  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: ControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutControlDatasInput, {
    nullable: false
  })
  create!: ControlFrameCreateWithoutControlDatasInput;
}
