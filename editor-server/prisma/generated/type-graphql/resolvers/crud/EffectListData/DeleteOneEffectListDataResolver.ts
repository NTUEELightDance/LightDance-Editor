import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { DeleteOneEffectListDataArgs } from "./args/DeleteOneEffectListDataArgs";
import { EffectListData } from "../../../models/EffectListData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EffectListData)
export class DeleteOneEffectListDataResolver {
  @TypeGraphQL.Mutation(_returns => EffectListData, {
    nullable: true
  })
  async deleteOneEffectListData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOneEffectListDataArgs): Promise<EffectListData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).effectListData.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
