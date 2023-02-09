import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateWithoutControlDatasInput } from "../inputs/ControlFrameCreateWithoutControlDatasInput";
import { ControlFrameUpdateWithoutControlDatasInput } from "../inputs/ControlFrameUpdateWithoutControlDatasInput";

@TypeGraphQL.InputType("ControlFrameUpsertWithoutControlDatasInput", {
  isAbstract: true
})
export class ControlFrameUpsertWithoutControlDatasInput {
  @TypeGraphQL.Field(_type => ControlFrameUpdateWithoutControlDatasInput, {
    nullable: false
  })
  update!: ControlFrameUpdateWithoutControlDatasInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutControlDatasInput, {
    nullable: false
  })
  create!: ControlFrameCreateWithoutControlDatasInput;
}
