import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindManyEditingPositionFrameArgs } from "./args/FindManyEditingPositionFrameArgs";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class FindManyEditingPositionFrameResolver {
  @TypeGraphQL.Query(_returns => [EditingPositionFrame], {
    nullable: false
  })
  async editingPositionFrames(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyEditingPositionFrameArgs): Promise<EditingPositionFrame[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
