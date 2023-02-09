import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateOrConnectWithoutControlDatasInput } from "../inputs/ControlFrameCreateOrConnectWithoutControlDatasInput";
import { ControlFrameCreateWithoutControlDatasInput } from "../inputs/ControlFrameCreateWithoutControlDatasInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameCreateNestedOneWithoutControlDatasInput", {
  isAbstract: true
})
export class ControlFrameCreateNestedOneWithoutControlDatasInput {
  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutControlDatasInput, {
    nullable: true
  })
  create?: ControlFrameCreateWithoutControlDatasInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameCreateOrConnectWithoutControlDatasInput, {
    nullable: true
  })
  connectOrCreate?: ControlFrameCreateOrConnectWithoutControlDatasInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: ControlFrameWhereUniqueInput | undefined;
}
