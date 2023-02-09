import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateWithoutPositionDatasInput } from "../inputs/PositionFrameCreateWithoutPositionDatasInput";
import { PositionFrameUpdateWithoutPositionDatasInput } from "../inputs/PositionFrameUpdateWithoutPositionDatasInput";

@TypeGraphQL.InputType("PositionFrameUpsertWithoutPositionDatasInput", {
  isAbstract: true
})
export class PositionFrameUpsertWithoutPositionDatasInput {
  @TypeGraphQL.Field(_type => PositionFrameUpdateWithoutPositionDatasInput, {
    nullable: false
  })
  update!: PositionFrameUpdateWithoutPositionDatasInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutPositionDatasInput, {
    nullable: false
  })
  create!: PositionFrameCreateWithoutPositionDatasInput;
}
