import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateWithoutPositionDataInput } from "../inputs/DancerCreateWithoutPositionDataInput";
import { DancerWhereUniqueInput } from "../inputs/DancerWhereUniqueInput";

@TypeGraphQL.InputType("DancerCreateOrConnectWithoutPositionDataInput", {
  isAbstract: true
})
export class DancerCreateOrConnectWithoutPositionDataInput {
  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: false
  })
  where!: DancerWhereUniqueInput;

  @TypeGraphQL.Field(_type => DancerCreateWithoutPositionDataInput, {
    nullable: false
  })
  create!: DancerCreateWithoutPositionDataInput;
}
