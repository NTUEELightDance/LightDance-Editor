import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateWithoutFrameInput } from "../inputs/PositionDataCreateWithoutFrameInput";
import { PositionDataUpdateWithoutFrameInput } from "../inputs/PositionDataUpdateWithoutFrameInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataUpsertWithWhereUniqueWithoutFrameInput", {
  isAbstract: true
})
export class PositionDataUpsertWithWhereUniqueWithoutFrameInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateWithoutFrameInput, {
    nullable: false
  })
  update!: PositionDataUpdateWithoutFrameInput;

  @TypeGraphQL.Field(_type => PositionDataCreateWithoutFrameInput, {
    nullable: false
  })
  create!: PositionDataCreateWithoutFrameInput;
}
