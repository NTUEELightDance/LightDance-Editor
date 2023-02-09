import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByControlFrameArgs } from "./args/GroupByControlFrameArgs";
import { ControlFrame } from "../../../models/ControlFrame";
import { ControlFrameGroupBy } from "../../outputs/ControlFrameGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlFrame)
export class GroupByControlFrameResolver {
  @TypeGraphQL.Query(_returns => [ControlFrameGroupBy], {
    nullable: false
  })
  async groupByControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByControlFrameArgs): Promise<ControlFrameGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).controlFrame.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
