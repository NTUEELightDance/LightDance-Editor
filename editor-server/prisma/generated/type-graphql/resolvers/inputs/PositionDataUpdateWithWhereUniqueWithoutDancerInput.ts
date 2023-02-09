import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataUpdateWithoutDancerInput } from "../inputs/PositionDataUpdateWithoutDancerInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpdateWithWhereUniqueWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataUpdateWithWhereUniqueWithoutDancerInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateWithoutDancerInput, {
    nullable: false
  })
  data!: PositionDataUpdateWithoutDancerInput;
}
