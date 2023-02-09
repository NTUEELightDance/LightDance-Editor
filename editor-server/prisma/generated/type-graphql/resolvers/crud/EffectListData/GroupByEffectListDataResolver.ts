import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByEffectListDataArgs } from "./args/GroupByEffectListDataArgs";
import { EffectListData } from "../../../models/EffectListData";
import { EffectListDataGroupBy } from "../../outputs/EffectListDataGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class GroupByEffectListDataResolver {
  @TypeGraphQL.Query(_returns => [EffectListDataGroupBy], {
    nullable: false
  })
  async groupByEffectListData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByEffectListDataArgs): Promise<EffectListDataGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).effectListData.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
