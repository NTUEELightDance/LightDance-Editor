import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartUpdateWithoutDancerInput } from "../inputs/PartUpdateWithoutDancerInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartUpdateWithWhereUniqueWithoutDancerInput", {
  isAbstract: true
})
export class PartUpdateWithWhereUniqueWithoutDancerInput {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;

  @TypeGraphQL.Field(_type => PartUpdateWithoutDancerInput, {
    nullable: false
  })
  data!: PartUpdateWithoutDancerInput;
}
