import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateManyDancerInputEnvelope } from "../inputs/PartCreateManyDancerInputEnvelope";
import { PartCreateOrConnectWithoutDancerInput } from "../inputs/PartCreateOrConnectWithoutDancerInput";
import { PartCreateWithoutDancerInput } from "../inputs/PartCreateWithoutDancerInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartCreateNestedManyWithoutDancerInput", {
  isAbstract: true
})
export class PartCreateNestedManyWithoutDancerInput {
  @TypeGraphQL.Field(_type => [PartCreateWithoutDancerInput], {
    nullable: true
  })
  create?: PartCreateWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartCreateOrConnectWithoutDancerInput], {
    nullable: true
  })
  connectOrCreate?: PartCreateOrConnectWithoutDancerInput[] | undefined;

  @TypeGraphQL.Field(_type => PartCreateManyDancerInputEnvelope, {
    nullable: true
  })
  createMany?: PartCreateManyDancerInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PartWhereUniqueInput], {
    nullable: true
  })
  connect?: PartWhereUniqueInput[] | undefined;
}
