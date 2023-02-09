import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueEffectListDataOrThrowArgs } from "./args/FindUniqueEffectListDataOrThrowArgs";
import { EffectListData } from "../../../models/EffectListData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class FindUniqueEffectListDataOrThrowResolver {
  @TypeGraphQL.Query(_returns => EffectListData, {
    nullable: true
  })
  async findUniqueEffectListDataOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEffectListDataOrThrowArgs): Promise<EffectListData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).effectListData.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
