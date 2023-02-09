import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstEditingPositionFrameOrThrowArgs } from "./args/FindFirstEditingPositionFrameOrThrowArgs";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class FindFirstEditingPositionFrameOrThrowResolver {
  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async findFirstEditingPositionFrameOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEditingPositionFrameOrThrowArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
