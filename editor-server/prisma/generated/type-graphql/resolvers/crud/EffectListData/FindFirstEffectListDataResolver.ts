import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstEffectListDataArgs } from "./args/FindFirstEffectListDataArgs";
import { EffectListData } from "../../../models/EffectListData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class FindFirstEffectListDataResolver {
  @TypeGraphQL.Query(_returns => EffectListData, {
    nullable: true
  })
  async findFirstEffectListData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEffectListDataArgs): Promise<EffectListData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).effectListData.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
