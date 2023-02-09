import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyFrameInputEnvelope } from "../inputs/PositionDataCreateManyFrameInputEnvelope";
import { PositionDataCreateOrConnectWithoutFrameInput } from "../inputs/PositionDataCreateOrConnectWithoutFrameInput";
import { PositionDataCreateWithoutFrameInput } from "../inputs/PositionDataCreateWithoutFrameInput";
import { PositionDataScalarWhereInput } from "../inputs/PositionDataScalarWhereInput";
import { PositionDataUpdateManyWithWhereWithoutFrameInput } from "../inputs/PositionDataUpdateManyWithWhereWithoutFrameInput";
import { PositionDataUpdateWithWhereUniqueWithoutFrameInput } from "../inputs/PositionDataUpdateWithWhereUniqueWithoutFrameInput";
import { PositionDataUpsertWithWhereUniqueWithoutFrameInput } from "../inputs/PositionDataUpsertWithWhereUniqueWithoutFrameInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpdateManyWithoutFrameNestedInput", {
  isAbstract: true
})
export class PositionDataUpdateManyWithoutFrameNestedInput {
  @TypeGraphQL.Field(_type => [PositionDataCreateWithoutFrameInput], {
    nullable: true
  })
  create?: PositionDataCreateWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataCreateOrConnectWithoutFrameInput], {
    nullable: true
  })
  connectOrCreate?: PositionDataCreateOrConnectWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataUpsertWithWhereUniqueWithoutFrameInput], {
    nullable: true
  })
  upsert?: PositionDataUpsertWithWhereUniqueWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateManyFrameInputEnvelope, {
    nullable: true
  })
  createMany?: PositionDataCreateManyFrameInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  set?: PositionDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  disconnect?: PositionDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  delete?: PositionDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  connect?: PositionDataWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataUpdateWithWhereUniqueWithoutFrameInput], {
    nullable: true
  })
  update?: PositionDataUpdateWithWhereUniqueWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataUpdateManyWithWhereWithoutFrameInput], {
    nullable: true
  })
  updateMany?: PositionDataUpdateManyWithWhereWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PositionDataScalarWhereInput[] | undefined;
}
