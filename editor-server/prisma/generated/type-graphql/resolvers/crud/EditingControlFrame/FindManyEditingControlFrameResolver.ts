import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindManyEditingControlFrameArgs } from "./args/FindManyEditingControlFrameArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class FindManyEditingControlFrameResolver {
  @TypeGraphQL.Query(_returns => [EditingControlFrame], {
    nullable: false
  })
  async editingControlFrames(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyEditingControlFrameArgs): Promise<EditingControlFrame[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
