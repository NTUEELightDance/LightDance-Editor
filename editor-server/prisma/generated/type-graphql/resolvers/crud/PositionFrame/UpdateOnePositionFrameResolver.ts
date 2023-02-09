import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpdateOnePositionFrameArgs } from "./args/UpdateOnePositionFrameArgs";
import { PositionFrame } from "../../../models/PositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class UpdateOnePositionFrameResolver {
  @TypeGraphQL.Mutation(_returns => PositionFrame, {
    nullable: true
  })
  async updateOnePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOnePositionFrameArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
