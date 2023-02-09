import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateNestedManyWithoutDancerInput } from "../inputs/PartCreateNestedManyWithoutDancerInput";
import { PositionDataCreateNestedManyWithoutDancerInput } from "../inputs/PositionDataCreateNestedManyWithoutDancerInput";

@TypeGraphQL.InputType("DancerCreateInput", {
  isAbstract: true
})
export class DancerCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PartCreateNestedManyWithoutDancerInput, {
    nullable: true
  })
  parts?: PartCreateNestedManyWithoutDancerInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateNestedManyWithoutDancerInput, {
    nullable: true
  })
  positionData?: PositionDataCreateNestedManyWithoutDancerInput | undefined;
}
