import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateNestedManyWithoutDancerInput } from "../inputs/PositionDataCreateNestedManyWithoutDancerInput";

@TypeGraphQL.InputType("DancerCreateWithoutPartsInput", {
  isAbstract: true
})
export class DancerCreateWithoutPartsInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PositionDataCreateNestedManyWithoutDancerInput, {
    nullable: true
  })
  positionData?: PositionDataCreateNestedManyWithoutDancerInput | undefined;
}
