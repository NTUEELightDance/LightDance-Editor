import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateWithoutDancerInput } from "../inputs/PositionDataCreateWithoutDancerInput";
import { PositionDataUpdateWithoutDancerInput } from "../inputs/PositionDataUpdateWithoutDancerInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpsertWithWhereUniqueWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataUpsertWithWhereUniqueWithoutDancerInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateWithoutDancerInput, {
    nullable: false
  })
  update!: PositionDataUpdateWithoutDancerInput;

  @TypeGraphQL.Field(_type => PositionDataCreateWithoutDancerInput, {
    nullable: false
  })
  create!: PositionDataCreateWithoutDancerInput;
}
