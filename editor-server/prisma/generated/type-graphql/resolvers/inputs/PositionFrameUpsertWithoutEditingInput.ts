import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateWithoutEditingInput } from "../inputs/PositionFrameCreateWithoutEditingInput";
import { PositionFrameUpdateWithoutEditingInput } from "../inputs/PositionFrameUpdateWithoutEditingInput";

@TypeGraphQL.InputType("PositionFrameUpsertWithoutEditingInput", {
  isAbstract: true
})
export class PositionFrameUpsertWithoutEditingInput {
  @TypeGraphQL.Field(_type => PositionFrameUpdateWithoutEditingInput, {
    nullable: false
  })
  update!: PositionFrameUpdateWithoutEditingInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutEditingInput, {
    nullable: false
  })
  create!: PositionFrameCreateWithoutEditingInput;
}
