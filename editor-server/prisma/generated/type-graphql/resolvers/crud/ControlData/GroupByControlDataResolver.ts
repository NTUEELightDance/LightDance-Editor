import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByControlDataArgs } from "./args/GroupByControlDataArgs";
import { ControlData } from "../../../models/ControlData";
import { ControlDataGroupBy } from "../../outputs/ControlDataGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlData)
export class GroupByControlDataResolver {
  @TypeGraphQL.Query(_returns => [ControlDataGroupBy], {
    nullable: false
  })
  async groupByControlData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByControlDataArgs): Promise<ControlDataGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).controlData.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
