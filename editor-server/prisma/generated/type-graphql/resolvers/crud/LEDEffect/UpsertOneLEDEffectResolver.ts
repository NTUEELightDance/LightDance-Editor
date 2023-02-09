import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpsertOneLEDEffectArgs } from "./args/UpsertOneLEDEffectArgs";
import { LEDEffect } from "../../../models/LEDEffect";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => LEDEffect)
export class UpsertOneLEDEffectResolver {
  @TypeGraphQL.Mutation(_returns => LEDEffect, {
    nullable: false
  })
  async upsertOneLEDEffect(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOneLEDEffectArgs): Promise<LEDEffect> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).lEDEffect.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
