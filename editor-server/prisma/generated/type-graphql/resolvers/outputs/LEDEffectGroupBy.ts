import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LEDEffectAvgAggregate } from "../outputs/LEDEffectAvgAggregate";
import { LEDEffectCountAggregate } from "../outputs/LEDEffectCountAggregate";
import { LEDEffectMaxAggregate } from "../outputs/LEDEffectMaxAggregate";
import { LEDEffectMinAggregate } from "../outputs/LEDEffectMinAggregate";
import { LEDEffectSumAggregate } from "../outputs/LEDEffectSumAggregate";

@TypeGraphQL.ObjectType("LEDEffectGroupBy", {
  isAbstract: true
})
export class LEDEffectGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  partName!: string;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  repeat!: number;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  frames!: Prisma.JsonValue[] | null;

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
