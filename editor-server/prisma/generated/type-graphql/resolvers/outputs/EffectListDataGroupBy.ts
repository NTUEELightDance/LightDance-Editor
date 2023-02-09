import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EffectListDataAvgAggregate } from "../outputs/EffectListDataAvgAggregate";
import { EffectListDataCountAggregate } from "../outputs/EffectListDataCountAggregate";
import { EffectListDataMaxAggregate } from "../outputs/EffectListDataMaxAggregate";
import { EffectListDataMinAggregate } from "../outputs/EffectListDataMinAggregate";
import { EffectListDataSumAggregate } from "../outputs/EffectListDataSumAggregate";

@TypeGraphQL.ObjectType("EffectListDataGroupBy", {
  isAbstract: true
})
export class EffectListDataGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  end!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  description!: string | null;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  dancerData!: Prisma.JsonValue[] | null;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  controlFrames!: Prisma.JsonValue[] | null;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  positionFrames!: Prisma.JsonValue[] | null;

  @TypeGraphQL.Field(_type => EffectListDataCountAggregate, {
    nullable: true
  })
  _count!: EffectListDataCountAggregate | null;

  @TypeGraphQL.Field(_type => EffectListDataAvgAggregate, {
    nullable: true
  })
  _avg!: EffectListDataAvgAggregate | null;

  @TypeGraphQL.Field(_type => EffectListDataSumAggregate, {
    nullable: true
  })
  _sum!: EffectListDataSumAggregate | null;

  @TypeGraphQL.Field(_type => EffectListDataMinAggregate, {
    nullable: true
  })
  _min!: EffectListDataMinAggregate | null;

  @TypeGraphQL.Field(_type => EffectListDataMaxAggregate, {
    nullable: true
  })
  _max!: EffectListDataMaxAggregate | null;
}
