import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LoggerAvgAggregate } from "../outputs/LoggerAvgAggregate";
import { LoggerCountAggregate } from "../outputs/LoggerCountAggregate";
import { LoggerMaxAggregate } from "../outputs/LoggerMaxAggregate";
import { LoggerMinAggregate } from "../outputs/LoggerMinAggregate";
import { LoggerSumAggregate } from "../outputs/LoggerSumAggregate";

@TypeGraphQL.ObjectType("AggregateLogger", {
  isAbstract: true
})
export class AggregateLogger {
  @TypeGraphQL.Field(_type => LoggerCountAggregate, {
    nullable: true
  })
  _count!: LoggerCountAggregate | null;

  @TypeGraphQL.Field(_type => LoggerAvgAggregate, {
    nullable: true
  })
  _avg!: LoggerAvgAggregate | null;

  @TypeGraphQL.Field(_type => LoggerSumAggregate, {
    nullable: true
  })
  _sum!: LoggerSumAggregate | null;

  @TypeGraphQL.Field(_type => LoggerMinAggregate, {
    nullable: true
  })
  _min!: LoggerMinAggregate | null;

  @TypeGraphQL.Field(_type => LoggerMaxAggregate, {
    nullable: true
  })
  _max!: LoggerMaxAggregate | null;
}
