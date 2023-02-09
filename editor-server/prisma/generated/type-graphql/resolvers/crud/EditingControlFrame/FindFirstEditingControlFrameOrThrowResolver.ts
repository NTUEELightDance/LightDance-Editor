import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstEditingControlFrameOrThrowArgs } from "./args/FindFirstEditingControlFrameOrThrowArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class FindFirstEditingControlFrameOrThrowResolver {
  @TypeGraphQL.Query(_returns => EditingControlFrame, {
    nullable: true
  })
  async findFirstEditingControlFrameOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEditingControlFrameOrThrowArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
