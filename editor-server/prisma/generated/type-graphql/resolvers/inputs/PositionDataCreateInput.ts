import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateNestedOneWithoutPositionDataInput } from "../inputs/DancerCreateNestedOneWithoutPositionDataInput";
import { PositionFrameCreateNestedOneWithoutPositionDatasInput } from "../inputs/PositionFrameCreateNestedOneWithoutPositionDatasInput";

@TypeGraphQL.InputType("PositionDataCreateInput", {
  isAbstract: true
})
export class PositionDataCreateInput {
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

  @TypeGraphQL.Field(_type => DancerCreateNestedOneWithoutPositionDataInput, {
    nullable: false
  })
  dancer!: DancerCreateNestedOneWithoutPositionDataInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateNestedOneWithoutPositionDatasInput, {
    nullable: false
  })
  frame!: PositionFrameCreateNestedOneWithoutPositionDatasInput;
}
