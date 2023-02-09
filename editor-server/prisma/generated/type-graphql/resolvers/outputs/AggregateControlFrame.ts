import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameAvgAggregate } from "../outputs/ControlFrameAvgAggregate";
import { ControlFrameCountAggregate } from "../outputs/ControlFrameCountAggregate";
import { ControlFrameMaxAggregate } from "../outputs/ControlFrameMaxAggregate";
import { ControlFrameMinAggregate } from "../outputs/ControlFrameMinAggregate";
import { ControlFrameSumAggregate } from "../outputs/ControlFrameSumAggregate";

@TypeGraphQL.ObjectType("AggregateControlFrame", {
  isAbstract: true
})
export class AggregateControlFrame {
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
