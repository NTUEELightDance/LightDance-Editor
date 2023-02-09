import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateDancerArgs } from "./args/AggregateDancerArgs";
import { Dancer } from "../../../models/Dancer";
import { AggregateDancer } from "../../outputs/AggregateDancer";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Dancer)
export class AggregateDancerResolver {
  @TypeGraphQL.Query(_returns => AggregateDancer, {
    nullable: false
  })
  async aggregateDancer(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateDancerArgs): Promise<AggregateDancer> {
    return getPrismaFromContext(ctx).dancer.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
