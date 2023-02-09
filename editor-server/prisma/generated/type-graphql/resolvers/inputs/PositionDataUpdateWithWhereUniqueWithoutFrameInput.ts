import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataUpdateWithoutFrameInput } from "../inputs/PositionDataUpdateWithoutFrameInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpdateWithWhereUniqueWithoutFrameInput", {
  isAbstract: true
})
export class PositionDataUpdateWithWhereUniqueWithoutFrameInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateWithoutFrameInput, {
    nullable: false
  })
  data!: PositionDataUpdateWithoutFrameInput;
}
