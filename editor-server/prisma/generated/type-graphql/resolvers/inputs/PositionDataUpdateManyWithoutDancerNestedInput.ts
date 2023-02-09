import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyDancerInputEnvelope } from "../inputs/PositionDataCreateManyDancerInputEnvelope";
import { PositionDataCreateOrConnectWithoutDancerInput } from "../inputs/PositionDataCreateOrConnectWithoutDancerInput";
import { PositionDataCreateWithoutDancerInput } from "../inputs/PositionDataCreateWithoutDancerInput";
import { PositionDataScalarWhereInput } from "../inputs/PositionDataScalarWhereInput";
import { PositionDataUpdateManyWithWhereWithoutDancerInput } from "../inputs/PositionDataUpdateManyWithWhereWithoutDancerInput";
import { PositionDataUpdateWithWhereUniqueWithoutDancerInput } from "../inputs/PositionDataUpdateWithWhereUniqueWithoutDancerInput";
import { PositionDataUpsertWithWhereUniqueWithoutDancerInput } from "../inputs/PositionDataUpsertWithWhereUniqueWithoutDancerInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpdateManyWithoutDancerNestedInput", {
  isAbstract: true
})
export class PositionDataUpdateManyWithoutDancerNestedInput {
  @TypeGraphQL.Field(_type => [PositionDataCreateWithoutDancerInput], {
    nullable: true
  })
  create?: PositionDataCreateWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataCreateOrConnectWithoutDancerInput], {
    nullable: true
  })
  connectOrCreate?: PositionDataCreateOrConnectWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataUpsertWithWhereUniqueWithoutDancerInput], {
    nullable: true
  })
  upsert?: PositionDataUpsertWithWhereUniqueWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateManyDancerInputEnvelope, {
    nullable: true
  })
  createMany?: PositionDataCreateManyDancerInputEnvelope | undefined;

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

  @TypeGraphQL.Field(_type => [PositionDataUpdateWithWhereUniqueWithoutDancerInput], {
    nullable: true
  })
  update?: PositionDataUpdateWithWhereUniqueWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataUpdateManyWithWhereWithoutDancerInput], {
    nullable: true
  })
  updateMany?: PositionDataUpdateManyWithWhereWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PositionDataScalarWhereInput[] | undefined;
}
