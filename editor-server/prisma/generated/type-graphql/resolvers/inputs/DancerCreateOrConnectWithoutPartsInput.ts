import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateWithoutPartsInput } from "../inputs/DancerCreateWithoutPartsInput";
import { DancerWhereUniqueInput } from "../inputs/DancerWhereUniqueInput";

@TypeGraphQL.InputType("DancerCreateOrConnectWithoutPartsInput", {
  isAbstract: true
})
export class DancerCreateOrConnectWithoutPartsInput {
  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: false
  })
  where!: DancerWhereUniqueInput;

  @TypeGraphQL.Field(_type => DancerCreateWithoutPartsInput, {
    nullable: false
  })
  create!: DancerCreateWithoutPartsInput;
}
