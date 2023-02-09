import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindUniqueEditingControlFrameArgs } from "./args/FindUniqueEditingControlFrameArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class FindUniqueEditingControlFrameResolver {
  @TypeGraphQL.Query(_returns => EditingControlFrame, {
    nullable: true
  })
  async editingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingControlFrameArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
