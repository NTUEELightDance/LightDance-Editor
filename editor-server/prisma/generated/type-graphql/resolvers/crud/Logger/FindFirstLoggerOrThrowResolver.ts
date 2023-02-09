import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstLoggerOrThrowArgs } from "./args/FindFirstLoggerOrThrowArgs";
import { Logger } from "../../../models/Logger";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Logger)
export class FindFirstLoggerOrThrowResolver {
  @TypeGraphQL.Query(_returns => Logger, {
    nullable: true
  })
  async findFirstLoggerOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstLoggerOrThrowArgs): Promise<Logger | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).logger.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
