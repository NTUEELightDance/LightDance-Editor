import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateLEDEffectArgs } from "./args/AggregateLEDEffectArgs";
import { LEDEffect } from "../../../models/LEDEffect";
import { AggregateLEDEffect } from "../../outputs/AggregateLEDEffect";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => LEDEffect)
export class AggregateLEDEffectResolver {
  @TypeGraphQL.Query(_returns => AggregateLEDEffect, {
    nullable: false
  })
  async aggregateLEDEffect(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateLEDEffectArgs): Promise<AggregateLEDEffect> {
    return getPrismaFromContext(ctx).lEDEffect.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
