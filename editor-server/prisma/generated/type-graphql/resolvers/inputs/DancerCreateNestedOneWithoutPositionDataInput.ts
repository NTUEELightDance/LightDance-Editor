import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateOrConnectWithoutPositionDataInput } from "../inputs/DancerCreateOrConnectWithoutPositionDataInput";
import { DancerCreateWithoutPositionDataInput } from "../inputs/DancerCreateWithoutPositionDataInput";
import { DancerWhereUniqueInput } from "../inputs/DancerWhereUniqueInput";

@TypeGraphQL.InputType("DancerCreateNestedOneWithoutPositionDataInput", {
  isAbstract: true
})
export class DancerCreateNestedOneWithoutPositionDataInput {
  @TypeGraphQL.Field(_type => DancerCreateWithoutPositionDataInput, {
    nullable: true
  })
  create?: DancerCreateWithoutPositionDataInput | undefined;

  @TypeGraphQL.Field(_type => DancerCreateOrConnectWithoutPositionDataInput, {
    nullable: true
  })
  connectOrCreate?: DancerCreateOrConnectWithoutPositionDataInput | undefined;

  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: true
  })
  connect?: DancerWhereUniqueInput | undefined;
}
