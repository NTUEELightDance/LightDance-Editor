import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateEffectListDataArgs } from "./args/AggregateEffectListDataArgs";
import { EffectListData } from "../../../models/EffectListData";
import { AggregateEffectListData } from "../../outputs/AggregateEffectListData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class AggregateEffectListDataResolver {
  @TypeGraphQL.Query(_returns => AggregateEffectListData, {
    nullable: false
  })
  async aggregateEffectListData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateEffectListDataArgs): Promise<AggregateEffectListData> {
    return getPrismaFromContext(ctx).effectListData.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
