import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerAvgAggregate } from "../outputs/DancerAvgAggregate";
import { DancerCountAggregate } from "../outputs/DancerCountAggregate";
import { DancerMaxAggregate } from "../outputs/DancerMaxAggregate";
import { DancerMinAggregate } from "../outputs/DancerMinAggregate";
import { DancerSumAggregate } from "../outputs/DancerSumAggregate";

@TypeGraphQL.ObjectType("AggregateDancer", {
  isAbstract: true
})
export class AggregateDancer {
  @TypeGraphQL.Field(_type => DancerCountAggregate, {
    nullable: true
  })
  _count!: DancerCountAggregate | null;

  @TypeGraphQL.Field(_type => DancerAvgAggregate, {
    nullable: true
  })
  _avg!: DancerAvgAggregate | null;

  @TypeGraphQL.Field(_type => DancerSumAggregate, {
    nullable: true
  })
  _sum!: DancerSumAggregate | null;

  @TypeGraphQL.Field(_type => DancerMinAggregate, {
    nullable: true
  })
  _min!: DancerMinAggregate | null;

  @TypeGraphQL.Field(_type => DancerMaxAggregate, {
    nullable: true
  })
  _max!: DancerMaxAggregate | null;
}
