import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateNestedOneWithoutPositionDatasInput } from "../inputs/PositionFrameCreateNestedOneWithoutPositionDatasInput";

@TypeGraphQL.InputType("PositionDataCreateWithoutDancerInput", {
  isAbstract: true
})
export class PositionDataCreateWithoutDancerInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  x!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  y!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  z!: number;

  @TypeGraphQL.Field(_type => PositionFrameCreateNestedOneWithoutPositionDatasInput, {
    nullable: false
  })
  frame!: PositionFrameCreateNestedOneWithoutPositionDatasInput;
}
