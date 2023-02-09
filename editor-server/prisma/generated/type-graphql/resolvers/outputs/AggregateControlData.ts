import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataAvgAggregate } from "../outputs/ControlDataAvgAggregate";
import { ControlDataCountAggregate } from "../outputs/ControlDataCountAggregate";
import { ControlDataMaxAggregate } from "../outputs/ControlDataMaxAggregate";
import { ControlDataMinAggregate } from "../outputs/ControlDataMinAggregate";
import { ControlDataSumAggregate } from "../outputs/ControlDataSumAggregate";

@TypeGraphQL.ObjectType("AggregateControlData", {
  isAbstract: true
})
export class AggregateControlData {
  @TypeGraphQL.Field(_type => ControlDataCountAggregate, {
    nullable: true
  })
  _count!: ControlDataCountAggregate | null;

  @TypeGraphQL.Field(_type => ControlDataAvgAggregate, {
    nullable: true
  })
  _avg!: ControlDataAvgAggregate | null;

  @TypeGraphQL.Field(_type => ControlDataSumAggregate, {
    nullable: true
  })
  _sum!: ControlDataSumAggregate | null;

  @TypeGraphQL.Field(_type => ControlDataMinAggregate, {
    nullable: true
  })
  _min!: ControlDataMinAggregate | null;

  @TypeGraphQL.Field(_type => ControlDataMaxAggregate, {
    nullable: true
  })
  _max!: ControlDataMaxAggregate | null;
}
