import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpsertOneEditingControlFrameArgs } from "./args/UpsertOneEditingControlFrameArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class UpsertOneEditingControlFrameResolver {
  @TypeGraphQL.Mutation(_returns => EditingControlFrame, {
    nullable: false
  })
  async upsertOneEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOneEditingControlFrameArgs): Promise<EditingControlFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
