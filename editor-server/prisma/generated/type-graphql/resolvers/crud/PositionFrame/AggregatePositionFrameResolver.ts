import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePositionFrameArgs } from "./args/AggregatePositionFrameArgs";
import { PositionFrame } from "../../../models/PositionFrame";
import { AggregatePositionFrame } from "../../outputs/AggregatePositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class AggregatePositionFrameResolver {
  @TypeGraphQL.Query(_returns => AggregatePositionFrame, {
    nullable: false
  })
  async aggregatePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePositionFrameArgs): Promise<AggregatePositionFrame> {
    return getPrismaFromContext(ctx).positionFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
