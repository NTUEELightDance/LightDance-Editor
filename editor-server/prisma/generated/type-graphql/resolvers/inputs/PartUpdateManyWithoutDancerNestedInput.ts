import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateManyDancerInputEnvelope } from "../inputs/PartCreateManyDancerInputEnvelope";
import { PartCreateOrConnectWithoutDancerInput } from "../inputs/PartCreateOrConnectWithoutDancerInput";
import { PartCreateWithoutDancerInput } from "../inputs/PartCreateWithoutDancerInput";
import { PartScalarWhereInput } from "../inputs/PartScalarWhereInput";
import { PartUpdateManyWithWhereWithoutDancerInput } from "../inputs/PartUpdateManyWithWhereWithoutDancerInput";
import { PartUpdateWithWhereUniqueWithoutDancerInput } from "../inputs/PartUpdateWithWhereUniqueWithoutDancerInput";
import { PartUpsertWithWhereUniqueWithoutDancerInput } from "../inputs/PartUpsertWithWhereUniqueWithoutDancerInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartUpdateManyWithoutDancerNestedInput", {
  isAbstract: true
})
export class PartUpdateManyWithoutDancerNestedInput {
  @TypeGraphQL.Field(_type => [PartCreateWithoutDancerInput], {
    nullable: true
  })
  create?: PartCreateWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartCreateOrConnectWithoutDancerInput], {
    nullable: true
  })
  connectOrCreate?: PartCreateOrConnectWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartUpsertWithWhereUniqueWithoutDancerInput], {
    nullable: true
  })
  upsert?: PartUpsertWithWhereUniqueWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => PartCreateManyDancerInputEnvelope, {
    nullable: true
  })
  createMany?: PartCreateManyDancerInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PartWhereUniqueInput], {
    nullable: true
  })
  set?: PartWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartWhereUniqueInput], {
    nullable: true
  })
  disconnect?: PartWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartWhereUniqueInput], {
    nullable: true
  })
  delete?: PartWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartWhereUniqueInput], {
    nullable: true
  })
  connect?: PartWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartUpdateWithWhereUniqueWithoutDancerInput], {
    nullable: true
  })
  update?: PartUpdateWithWhereUniqueWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartUpdateManyWithWhereWithoutDancerInput], {
    nullable: true
  })
  updateMany?: PartUpdateManyWithWhereWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PartScalarWhereInput[] | undefined;
}
