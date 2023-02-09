import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartAvgAggregate } from "../outputs/PartAvgAggregate";
import { PartCountAggregate } from "../outputs/PartCountAggregate";
import { PartMaxAggregate } from "../outputs/PartMaxAggregate";
import { PartMinAggregate } from "../outputs/PartMinAggregate";
import { PartSumAggregate } from "../outputs/PartSumAggregate";

@TypeGraphQL.ObjectType("AggregatePart", {
  isAbstract: true
})
export class AggregatePart {
  @TypeGraphQL.Field(_type => PartCountAggregate, {
    nullable: true
  })
  _count!: PartCountAggregate | null;

  @TypeGraphQL.Field(_type => PartAvgAggregate, {
    nullable: true
  })
  _avg!: PartAvgAggregate | null;

  @TypeGraphQL.Field(_type => PartSumAggregate, {
    nullable: true
  })
  _sum!: PartSumAggregate | null;

  @TypeGraphQL.Field(_type => PartMinAggregate, {
    nullable: true
  })
  _min!: PartMinAggregate | null;

  @TypeGraphQL.Field(_type => PartMaxAggregate, {
    nullable: true
  })
  _max!: PartMaxAggregate | null;
}
