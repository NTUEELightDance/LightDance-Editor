import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateNestedManyWithoutDancerInput } from "../inputs/PartCreateNestedManyWithoutDancerInput";

@TypeGraphQL.InputType("DancerCreateWithoutPositionDataInput", {
  isAbstract: true
})
export class DancerCreateWithoutPositionDataInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PartCreateNestedManyWithoutDancerInput, {
    nullable: true
  })
  parts?: PartCreateNestedManyWithoutDancerInput | undefined;
}
