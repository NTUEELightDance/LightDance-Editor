import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueLEDEffectOrThrowArgs } from "./args/FindUniqueLEDEffectOrThrowArgs";
import { LEDEffect } from "../../../models/LEDEffect";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => LEDEffect)
export class FindUniqueLEDEffectOrThrowResolver {
  @TypeGraphQL.Query(_returns => LEDEffect, {
    nullable: true
  })
  async getLEDEffect(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueLEDEffectOrThrowArgs): Promise<LEDEffect | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).lEDEffect.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
