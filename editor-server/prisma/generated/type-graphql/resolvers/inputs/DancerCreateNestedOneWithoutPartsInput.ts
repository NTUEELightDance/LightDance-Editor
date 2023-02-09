import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateOrConnectWithoutPartsInput } from "../inputs/DancerCreateOrConnectWithoutPartsInput";
import { DancerCreateWithoutPartsInput } from "../inputs/DancerCreateWithoutPartsInput";
import { DancerWhereUniqueInput } from "../inputs/DancerWhereUniqueInput";

@TypeGraphQL.InputType("DancerCreateNestedOneWithoutPartsInput", {
  isAbstract: true
})
export class DancerCreateNestedOneWithoutPartsInput {
  @TypeGraphQL.Field(_type => DancerCreateWithoutPartsInput, {
    nullable: true
  })
  create?: DancerCreateWithoutPartsInput | undefined;

  @TypeGraphQL.Field(_type => DancerCreateOrConnectWithoutPartsInput, {
    nullable: true
  })
  connectOrCreate?: DancerCreateOrConnectWithoutPartsInput | undefined;

  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: true
  })
  connect?: DancerWhereUniqueInput | undefined;
}
