import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LoggerAvgAggregate } from "../outputs/LoggerAvgAggregate";
import { LoggerCountAggregate } from "../outputs/LoggerCountAggregate";
import { LoggerMaxAggregate } from "../outputs/LoggerMaxAggregate";
import { LoggerMinAggregate } from "../outputs/LoggerMinAggregate";
import { LoggerSumAggregate } from "../outputs/LoggerSumAggregate";

@TypeGraphQL.ObjectType("LoggerGroupBy", {
  isAbstract: true
})
export class LoggerGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  user!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  variableValue!: Prisma.JsonValue | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  fieldName!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  time!: Date;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  status!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  errorMessage!: Prisma.JsonValue | null;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  result!: Prisma.JsonValue | null;

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
