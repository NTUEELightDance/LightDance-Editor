import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameAvgAggregate } from "../outputs/ControlFrameAvgAggregate";
import { ControlFrameCountAggregate } from "../outputs/ControlFrameCountAggregate";
import { ControlFrameMaxAggregate } from "../outputs/ControlFrameMaxAggregate";
import { ControlFrameMinAggregate } from "../outputs/ControlFrameMinAggregate";
import { ControlFrameSumAggregate } from "../outputs/ControlFrameSumAggregate";

@TypeGraphQL.ObjectType("ControlFrameGroupBy", {
  isAbstract: true
})
export class ControlFrameGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  fade!: boolean;

  @TypeGraphQL.Field(_type => ControlFrameCountAggregate, {
    nullable: true
  })
  _count!: ControlFrameCountAggregate | null;

  @TypeGraphQL.Field(_type => ControlFrameAvgAggregate, {
    nullable: true
  })
  _avg!: ControlFrameAvgAggregate | null;

  @TypeGraphQL.Field(_type => ControlFrameSumAggregate, {
    nullable: true
  })
  _sum!: ControlFrameSumAggregate | null;

  @TypeGraphQL.Field(_type => ControlFrameMinAggregate, {
    nullable: true
  })
  _min!: ControlFrameMinAggregate | null;

  @TypeGraphQL.Field(_type => ControlFrameMaxAggregate, {
    nullable: true
  })
  _max!: ControlFrameMaxAggregate | null;
}
