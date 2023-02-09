import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueEditingPositionFrameOrThrowArgs } from "./args/FindUniqueEditingPositionFrameOrThrowArgs";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class FindUniqueEditingPositionFrameOrThrowResolver {
  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async getEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingPositionFrameOrThrowArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
