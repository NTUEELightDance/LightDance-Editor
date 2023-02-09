import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateLoggerArgs } from "./args/AggregateLoggerArgs";
import { Logger } from "../../../models/Logger";
import { AggregateLogger } from "../../outputs/AggregateLogger";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Logger)
export class AggregateLoggerResolver {
  @TypeGraphQL.Query(_returns => AggregateLogger, {
    nullable: false
  })
  async aggregateLogger(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateLoggerArgs): Promise<AggregateLogger> {
    return getPrismaFromContext(ctx).logger.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
