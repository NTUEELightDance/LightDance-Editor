import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyDancerInputEnvelope } from "../inputs/PositionDataCreateManyDancerInputEnvelope";
import { PositionDataCreateOrConnectWithoutDancerInput } from "../inputs/PositionDataCreateOrConnectWithoutDancerInput";
import { PositionDataCreateWithoutDancerInput } from "../inputs/PositionDataCreateWithoutDancerInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataCreateNestedManyWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataCreateNestedManyWithoutDancerInput {
  @TypeGraphQL.Field(_type => [PositionDataCreateWithoutDancerInput], {
    nullable: true
  })
  create?: PositionDataCreateWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataCreateOrConnectWithoutDancerInput], {
    nullable: true
  })
  connectOrCreate?: PositionDataCreateOrConnectWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateManyDancerInputEnvelope, {
    nullable: true
  })
  createMany?: PositionDataCreateManyDancerInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  connect?: PositionDataWhereUniqueInput[] | undefined;
}
