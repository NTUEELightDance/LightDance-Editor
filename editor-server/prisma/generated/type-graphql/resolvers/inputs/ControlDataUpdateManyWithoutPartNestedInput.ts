import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyPartInputEnvelope } from "../inputs/ControlDataCreateManyPartInputEnvelope";
import { ControlDataCreateOrConnectWithoutPartInput } from "../inputs/ControlDataCreateOrConnectWithoutPartInput";
import { ControlDataCreateWithoutPartInput } from "../inputs/ControlDataCreateWithoutPartInput";
import { ControlDataScalarWhereInput } from "../inputs/ControlDataScalarWhereInput";
import { ControlDataUpdateManyWithWhereWithoutPartInput } from "../inputs/ControlDataUpdateManyWithWhereWithoutPartInput";
import { ControlDataUpdateWithWhereUniqueWithoutPartInput } from "../inputs/ControlDataUpdateWithWhereUniqueWithoutPartInput";
import { ControlDataUpsertWithWhereUniqueWithoutPartInput } from "../inputs/ControlDataUpsertWithWhereUniqueWithoutPartInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataUpdateManyWithoutPartNestedInput", {
  isAbstract: true
})
export class ControlDataUpdateManyWithoutPartNestedInput {
  @TypeGraphQL.Field(_type => [ControlDataCreateWithoutPartInput], {
    nullable: true
  })
  create?: ControlDataCreateWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataCreateOrConnectWithoutPartInput], {
    nullable: true
  })
  connectOrCreate?: ControlDataCreateOrConnectWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataUpsertWithWhereUniqueWithoutPartInput], {
    nullable: true
  })
  upsert?: ControlDataUpsertWithWhereUniqueWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlDataCreateManyPartInputEnvelope, {
    nullable: true
  })
  createMany?: ControlDataCreateManyPartInputEnvelope | undefined;

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

  @TypeGraphQL.Field(_type => [ControlDataUpdateWithWhereUniqueWithoutPartInput], {
    nullable: true
  })
  update?: ControlDataUpdateWithWhereUniqueWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataUpdateManyWithWhereWithoutPartInput], {
    nullable: true
  })
  updateMany?: ControlDataUpdateManyWithWhereWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereInput], {
    nullable: true
  })
  deleteMany?: ControlDataScalarWhereInput[] | undefined;
}
