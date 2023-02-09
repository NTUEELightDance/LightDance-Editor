import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateWithoutPositionDatasInput } from "../inputs/PositionFrameCreateWithoutPositionDatasInput";
import { PositionFrameWhereUniqueInput } from "../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("PositionFrameCreateOrConnectWithoutPositionDatasInput", {
  isAbstract: true
})
export class PositionFrameCreateOrConnectWithoutPositionDatasInput {
  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: PositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutPositionDatasInput, {
    nullable: false
  })
  create!: PositionFrameCreateWithoutPositionDatasInput;
}
