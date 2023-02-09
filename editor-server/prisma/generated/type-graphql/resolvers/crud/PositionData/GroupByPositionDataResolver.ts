import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByPositionDataArgs } from "./args/GroupByPositionDataArgs";
import { PositionData } from "../../../models/PositionData";
import { PositionDataGroupBy } from "../../outputs/PositionDataGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionData)
export class GroupByPositionDataResolver {
  @TypeGraphQL.Query(_returns => [PositionDataGroupBy], {
    nullable: false
  })
  async groupByPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByPositionDataArgs): Promise<PositionDataGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
