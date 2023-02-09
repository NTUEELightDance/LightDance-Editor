import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpdateOneEffectListDataArgs } from "./args/UpdateOneEffectListDataArgs";
import { EffectListData } from "../../../models/EffectListData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class UpdateOneEffectListDataResolver {
  @TypeGraphQL.Mutation(_returns => EffectListData, {
    nullable: true
  })
  async updateOneEffectListData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneEffectListDataArgs): Promise<EffectListData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).effectListData.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
