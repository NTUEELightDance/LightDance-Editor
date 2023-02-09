import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyFrameInputEnvelope } from "../inputs/ControlDataCreateManyFrameInputEnvelope";
import { ControlDataCreateOrConnectWithoutFrameInput } from "../inputs/ControlDataCreateOrConnectWithoutFrameInput";
import { ControlDataCreateWithoutFrameInput } from "../inputs/ControlDataCreateWithoutFrameInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataCreateNestedManyWithoutFrameInput", {
  isAbstract: true
})
export class ControlDataCreateNestedManyWithoutFrameInput {
  @TypeGraphQL.Field(_type => [ControlDataCreateWithoutFrameInput], {
    nullable: true
  })
  create?: ControlDataCreateWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataCreateOrConnectWithoutFrameInput], {
    nullable: true
  })
  connectOrCreate?: ControlDataCreateOrConnectWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlDataCreateManyFrameInputEnvelope, {
    nullable: true
  })
  createMany?: ControlDataCreateManyFrameInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  connect?: ControlDataWhereUniqueInput[] | undefined;
}
