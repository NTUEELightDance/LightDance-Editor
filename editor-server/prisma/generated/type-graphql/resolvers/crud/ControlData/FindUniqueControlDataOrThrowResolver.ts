import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueControlDataOrThrowArgs } from "./args/FindUniqueControlDataOrThrowArgs";
import { ControlData } from "../../../models/ControlData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlData)
export class FindUniqueControlDataOrThrowResolver {
  @TypeGraphQL.Query(_returns => ControlData, {
    nullable: true
  })
  async findUniqueControlDataOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueControlDataOrThrowArgs): Promise<ControlData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).controlData.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
