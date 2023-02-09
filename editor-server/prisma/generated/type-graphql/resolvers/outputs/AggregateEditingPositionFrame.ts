import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameAvgAggregate } from "../outputs/EditingPositionFrameAvgAggregate";
import { EditingPositionFrameCountAggregate } from "../outputs/EditingPositionFrameCountAggregate";
import { EditingPositionFrameMaxAggregate } from "../outputs/EditingPositionFrameMaxAggregate";
import { EditingPositionFrameMinAggregate } from "../outputs/EditingPositionFrameMinAggregate";
import { EditingPositionFrameSumAggregate } from "../outputs/EditingPositionFrameSumAggregate";

@TypeGraphQL.ObjectType("AggregateEditingPositionFrame", {
  isAbstract: true
})
export class AggregateEditingPositionFrame {
  @TypeGraphQL.Field(_type => EditingPositionFrameCountAggregate, {
    nullable: true
  })
  _count!: EditingPositionFrameCountAggregate | null;

  @TypeGraphQL.Field(_type => EditingPositionFrameAvgAggregate, {
    nullable: true
  })
  _avg!: EditingPositionFrameAvgAggregate | null;

  @TypeGraphQL.Field(_type => EditingPositionFrameSumAggregate, {
    nullable: true
  })
  _sum!: EditingPositionFrameSumAggregate | null;

  @TypeGraphQL.Field(_type => EditingPositionFrameMinAggregate, {
    nullable: true
  })
  _min!: EditingPositionFrameMinAggregate | null;

  @TypeGraphQL.Field(_type => EditingPositionFrameMaxAggregate, {
    nullable: true
  })
  _max!: EditingPositionFrameMaxAggregate | null;
}
