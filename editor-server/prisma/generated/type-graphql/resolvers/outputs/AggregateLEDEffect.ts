import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LEDEffectAvgAggregate } from "../outputs/LEDEffectAvgAggregate";
import { LEDEffectCountAggregate } from "../outputs/LEDEffectCountAggregate";
import { LEDEffectMaxAggregate } from "../outputs/LEDEffectMaxAggregate";
import { LEDEffectMinAggregate } from "../outputs/LEDEffectMinAggregate";
import { LEDEffectSumAggregate } from "../outputs/LEDEffectSumAggregate";

@TypeGraphQL.ObjectType("AggregateLEDEffect", {
  isAbstract: true
})
export class AggregateLEDEffect {
  @TypeGraphQL.Field(_type => LEDEffectCountAggregate, {
    nullable: true
  })
  _count!: LEDEffectCountAggregate | null;

  @TypeGraphQL.Field(_type => LEDEffectAvgAggregate, {
    nullable: true
  })
  _avg!: LEDEffectAvgAggregate | null;

  @TypeGraphQL.Field(_type => LEDEffectSumAggregate, {
    nullable: true
  })
  _sum!: LEDEffectSumAggregate | null;

  @TypeGraphQL.Field(_type => LEDEffectMinAggregate, {
    nullable: true
  })
  _min!: LEDEffectMinAggregate | null;

  @TypeGraphQL.Field(_type => LEDEffectMaxAggregate, {
    nullable: true
  })
  _max!: LEDEffectMaxAggregate | null;
}
