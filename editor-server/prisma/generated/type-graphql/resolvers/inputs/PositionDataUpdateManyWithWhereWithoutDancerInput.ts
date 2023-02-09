import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataScalarWhereInput } from "../inputs/PositionDataScalarWhereInput";
import { PositionDataUpdateManyMutationInput } from "../inputs/PositionDataUpdateManyMutationInput";

@TypeGraphQL.InputType("PositionDataUpdateManyWithWhereWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataUpdateManyWithWhereWithoutDancerInput {
  @TypeGraphQL.Field(_type => PositionDataScalarWhereInput, {
    nullable: false
  })
  where!: PositionDataScalarWhereInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateManyMutationInput, {
    nullable: false
  })
  data!: PositionDataUpdateManyMutationInput;
}
