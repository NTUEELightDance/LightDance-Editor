import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpdateOneControlFrameArgs } from "./args/UpdateOneControlFrameArgs";
import { ControlFrame } from "../../../models/ControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlFrame)
export class UpdateOneControlFrameResolver {
  @TypeGraphQL.Mutation(_returns => ControlFrame, {
    nullable: true
  })
  async updateOneControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneControlFrameArgs): Promise<ControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).controlFrame.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
