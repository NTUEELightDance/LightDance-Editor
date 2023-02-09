import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyFrameInputEnvelope } from "../inputs/ControlDataCreateManyFrameInputEnvelope";
import { ControlDataCreateOrConnectWithoutFrameInput } from "../inputs/ControlDataCreateOrConnectWithoutFrameInput";
import { ControlDataCreateWithoutFrameInput } from "../inputs/ControlDataCreateWithoutFrameInput";
import { ControlDataScalarWhereInput } from "../inputs/ControlDataScalarWhereInput";
import { ControlDataUpdateManyWithWhereWithoutFrameInput } from "../inputs/ControlDataUpdateManyWithWhereWithoutFrameInput";
import { ControlDataUpdateWithWhereUniqueWithoutFrameInput } from "../inputs/ControlDataUpdateWithWhereUniqueWithoutFrameInput";
import { ControlDataUpsertWithWhereUniqueWithoutFrameInput } from "../inputs/ControlDataUpsertWithWhereUniqueWithoutFrameInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpdateManyWithoutFrameNestedInput", {
  isAbstract: true
})
export class ControlDataUpdateManyWithoutFrameNestedInput {
  @TypeGraphQL.Field(_type => [ControlDataCreateWithoutFrameInput], {
    nullable: true
  })
  create?: ControlDataCreateWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataCreateOrConnectWithoutFrameInput], {
    nullable: true
  })
  connectOrCreate?: ControlDataCreateOrConnectWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataUpsertWithWhereUniqueWithoutFrameInput], {
    nullable: true
  })
  upsert?: ControlDataUpsertWithWhereUniqueWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlDataCreateManyFrameInputEnvelope, {
    nullable: true
  })
  createMany?: ControlDataCreateManyFrameInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  set?: ControlDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  disconnect?: ControlDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  delete?: ControlDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  connect?: ControlDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataUpdateWithWhereUniqueWithoutFrameInput], {
    nullable: true
  })
  update?: ControlDataUpdateWithWhereUniqueWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataUpdateManyWithWhereWithoutFrameInput], {
    nullable: true
  })
  updateMany?: ControlDataUpdateManyWithWhereWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereInput], {
    nullable: true
  })
  deleteMany?: ControlDataScalarWhereInput[] | undefined;
}
