import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateWithoutDancerInput } from "../inputs/PartCreateWithoutDancerInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartCreateOrConnectWithoutDancerInput", {
  isAbstract: true
})
export class PartCreateOrConnectWithoutDancerInput {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;

  @TypeGraphQL.Field(_type => PartCreateWithoutDancerInput, {
    nullable: false
  })
  create!: PartCreateWithoutDancerInput;
}
