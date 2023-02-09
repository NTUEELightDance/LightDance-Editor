import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataAvgAggregate } from "../outputs/PositionDataAvgAggregate";
import { PositionDataCountAggregate } from "../outputs/PositionDataCountAggregate";
import { PositionDataMaxAggregate } from "../outputs/PositionDataMaxAggregate";
import { PositionDataMinAggregate } from "../outputs/PositionDataMinAggregate";
import { PositionDataSumAggregate } from "../outputs/PositionDataSumAggregate";

@TypeGraphQL.ObjectType("PositionDataGroupBy", {
  isAbstract: true
})
export class PositionDataGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  dancerId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  frameId!: number;

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

  @TypeGraphQL.Field(_type => PositionDataCountAggregate, {
    nullable: true
  })
  _count!: PositionDataCountAggregate | null;

  @TypeGraphQL.Field(_type => PositionDataAvgAggregate, {
    nullable: true
  })
  _avg!: PositionDataAvgAggregate | null;

  @TypeGraphQL.Field(_type => PositionDataSumAggregate, {
    nullable: true
  })
  _sum!: PositionDataSumAggregate | null;

  @TypeGraphQL.Field(_type => PositionDataMinAggregate, {
    nullable: true
  })
  _min!: PositionDataMinAggregate | null;

  @TypeGraphQL.Field(_type => PositionDataMaxAggregate, {
    nullable: true
  })
  _max!: PositionDataMaxAggregate | null;
}
