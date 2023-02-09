import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameAvgAggregate } from "../outputs/EditingControlFrameAvgAggregate";
import { EditingControlFrameCountAggregate } from "../outputs/EditingControlFrameCountAggregate";
import { EditingControlFrameMaxAggregate } from "../outputs/EditingControlFrameMaxAggregate";
import { EditingControlFrameMinAggregate } from "../outputs/EditingControlFrameMinAggregate";
import { EditingControlFrameSumAggregate } from "../outputs/EditingControlFrameSumAggregate";

@TypeGraphQL.ObjectType("EditingControlFrameGroupBy", {
  isAbstract: true
})
export class EditingControlFrameGroupBy {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  userId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  frameId!: number | null;

  @TypeGraphQL.Field(_type => EditingControlFrameCountAggregate, {
    nullable: true
  })
  _count!: EditingControlFrameCountAggregate | null;

  @TypeGraphQL.Field(_type => EditingControlFrameAvgAggregate, {
    nullable: true
  })
  _avg!: EditingControlFrameAvgAggregate | null;

  @TypeGraphQL.Field(_type => EditingControlFrameSumAggregate, {
    nullable: true
  })
  _sum!: EditingControlFrameSumAggregate | null;

  @TypeGraphQL.Field(_type => EditingControlFrameMinAggregate, {
    nullable: true
  })
  _min!: EditingControlFrameMinAggregate | null;

  @TypeGraphQL.Field(_type => EditingControlFrameMaxAggregate, {
    nullable: true
  })
  _max!: EditingControlFrameMaxAggregate | null;
}
