import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpdateOneLEDEffectArgs } from "./args/UpdateOneLEDEffectArgs";
import { LEDEffect } from "../../../models/LEDEffect";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => LEDEffect)
export class UpdateOneLEDEffectResolver {
  @TypeGraphQL.Mutation(_returns => LEDEffect, {
    nullable: true
  })
  async updateOneLEDEffect(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneLEDEffectArgs): Promise<LEDEffect | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).lEDEffect.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
