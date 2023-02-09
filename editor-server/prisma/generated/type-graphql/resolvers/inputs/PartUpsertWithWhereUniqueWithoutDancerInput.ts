import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateWithoutDancerInput } from "../inputs/PartCreateWithoutDancerInput";
import { PartUpdateWithoutDancerInput } from "../inputs/PartUpdateWithoutDancerInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartUpsertWithWhereUniqueWithoutDancerInput", {
  isAbstract: true
})
export class PartUpsertWithWhereUniqueWithoutDancerInput {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;

  @TypeGraphQL.Field(_type => PartUpdateWithoutDancerInput, {
    nullable: false
  })
  update!: PartUpdateWithoutDancerInput;

  @TypeGraphQL.Field(_type => PartCreateWithoutDancerInput, {
    nullable: false
  })
  create!: PartCreateWithoutDancerInput;
}
