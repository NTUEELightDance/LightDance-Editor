import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueEditingPositionFrameArgs } from "./args/FindUniqueEditingPositionFrameArgs";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class FindUniqueEditingPositionFrameResolver {
  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async editingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingPositionFrameArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
