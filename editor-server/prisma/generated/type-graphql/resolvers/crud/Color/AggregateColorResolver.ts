import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateColorArgs } from "./args/AggregateColorArgs";
import { Color } from "../../../models/Color";
import { AggregateColor } from "../../outputs/AggregateColor";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Color)
export class AggregateColorResolver {
  @TypeGraphQL.Query(_returns => AggregateColor, {
    nullable: false
  })
  async aggregateColor(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateColorArgs): Promise<AggregateColor> {
    return getPrismaFromContext(ctx).color.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
