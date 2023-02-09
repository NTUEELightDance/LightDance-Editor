import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByLEDEffectArgs } from "./args/GroupByLEDEffectArgs";
import { LEDEffect } from "../../../models/LEDEffect";
import { LEDEffectGroupBy } from "../../outputs/LEDEffectGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => LEDEffect)
export class GroupByLEDEffectResolver {
  @TypeGraphQL.Query(_returns => [LEDEffectGroupBy], {
    nullable: false
  })
  async groupByLEDEffect(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByLEDEffectArgs): Promise<LEDEffectGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).lEDEffect.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
