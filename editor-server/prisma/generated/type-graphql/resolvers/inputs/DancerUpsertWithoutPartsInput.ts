import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateWithoutPartsInput } from "../inputs/DancerCreateWithoutPartsInput";
import { DancerUpdateWithoutPartsInput } from "../inputs/DancerUpdateWithoutPartsInput";

@TypeGraphQL.InputType("DancerUpsertWithoutPartsInput", {
  isAbstract: true
})
export class DancerUpsertWithoutPartsInput {
  @TypeGraphQL.Field(_type => DancerUpdateWithoutPartsInput, {
    nullable: false
  })
  update!: DancerUpdateWithoutPartsInput;

  @TypeGraphQL.Field(_type => DancerCreateWithoutPartsInput, {
    nullable: false
  })
  create!: DancerCreateWithoutPartsInput;
}
