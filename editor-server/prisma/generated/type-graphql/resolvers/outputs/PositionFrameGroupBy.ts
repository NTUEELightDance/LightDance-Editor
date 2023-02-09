import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameAvgAggregate } from "../outputs/PositionFrameAvgAggregate";
import { PositionFrameCountAggregate } from "../outputs/PositionFrameCountAggregate";
import { PositionFrameMaxAggregate } from "../outputs/PositionFrameMaxAggregate";
import { PositionFrameMinAggregate } from "../outputs/PositionFrameMinAggregate";
import { PositionFrameSumAggregate } from "../outputs/PositionFrameSumAggregate";

@TypeGraphQL.ObjectType("PositionFrameGroupBy", {
  isAbstract: true
})
export class PositionFrameGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => PositionFrameCountAggregate, {
    nullable: true
  })
  _count!: PositionFrameCountAggregate | null;

  @TypeGraphQL.Field(_type => PositionFrameAvgAggregate, {
    nullable: true
  })
  _avg!: PositionFrameAvgAggregate | null;

  @TypeGraphQL.Field(_type => PositionFrameSumAggregate, {
    nullable: true
  })
  _sum!: PositionFrameSumAggregate | null;

  @TypeGraphQL.Field(_type => PositionFrameMinAggregate, {
    nullable: true
  })
  _min!: PositionFrameMinAggregate | null;

  @TypeGraphQL.Field(_type => PositionFrameMaxAggregate, {
    nullable: true
  })
  _max!: PositionFrameMaxAggregate | null;
}
