import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartAvgAggregate } from "../outputs/PartAvgAggregate";
import { PartCountAggregate } from "../outputs/PartCountAggregate";
import { PartMaxAggregate } from "../outputs/PartMaxAggregate";
import { PartMinAggregate } from "../outputs/PartMinAggregate";
import { PartSumAggregate } from "../outputs/PartSumAggregate";
import { PartType } from "../../enums/PartType";

@TypeGraphQL.ObjectType("PartGroupBy", {
  isAbstract: true
})
export class PartGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  dancerId!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PartType, {
    nullable: false
  })
  type!: "LED" | "FIBER";

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
