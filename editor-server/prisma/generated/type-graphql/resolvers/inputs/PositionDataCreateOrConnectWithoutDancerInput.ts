import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateWithoutDancerInput } from "../inputs/PositionDataCreateWithoutDancerInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataCreateOrConnectWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataCreateOrConnectWithoutDancerInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataCreateWithoutDancerInput, {
    nullable: false
  })
  create!: PositionDataCreateWithoutDancerInput;
}
