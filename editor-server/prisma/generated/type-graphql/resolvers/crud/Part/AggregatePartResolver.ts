import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePartArgs } from "./args/AggregatePartArgs";
import { Part } from "../../../models/Part";
import { AggregatePart } from "../../outputs/AggregatePart";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Part)
export class AggregatePartResolver {
  @TypeGraphQL.Query(_returns => AggregatePart, {
    nullable: false
  })
  async aggregatePart(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePartArgs): Promise<AggregatePart> {
    return getPrismaFromContext(ctx).part.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
