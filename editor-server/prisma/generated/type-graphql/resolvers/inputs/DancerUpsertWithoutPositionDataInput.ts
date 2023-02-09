import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateWithoutPositionDataInput } from "../inputs/DancerCreateWithoutPositionDataInput";
import { DancerUpdateWithoutPositionDataInput } from "../inputs/DancerUpdateWithoutPositionDataInput";

@TypeGraphQL.InputType("DancerUpsertWithoutPositionDataInput", {
  isAbstract: true
})
export class DancerUpsertWithoutPositionDataInput {
  @TypeGraphQL.Field(_type => DancerUpdateWithoutPositionDataInput, {
    nullable: false
  })
  update!: DancerUpdateWithoutPositionDataInput;

  @TypeGraphQL.Field(_type => DancerCreateWithoutPositionDataInput, {
    nullable: false
  })
  create!: DancerCreateWithoutPositionDataInput;
}
