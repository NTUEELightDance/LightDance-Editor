import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByPositionFrameArgs } from "./args/GroupByPositionFrameArgs";
import { PositionFrame } from "../../../models/PositionFrame";
import { PositionFrameGroupBy } from "../../outputs/PositionFrameGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class GroupByPositionFrameResolver {
  @TypeGraphQL.Query(_returns => [PositionFrameGroupBy], {
    nullable: false
  })
  async groupByPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByPositionFrameArgs): Promise<PositionFrameGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
