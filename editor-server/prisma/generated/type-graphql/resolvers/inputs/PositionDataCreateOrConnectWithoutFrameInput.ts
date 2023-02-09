import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateWithoutFrameInput } from "../inputs/PositionDataCreateWithoutFrameInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataCreateOrConnectWithoutFrameInput", {
  isAbstract: true
})
export class PositionDataCreateOrConnectWithoutFrameInput {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataCreateWithoutFrameInput, {
    nullable: false
  })
  create!: PositionDataCreateWithoutFrameInput;
}
