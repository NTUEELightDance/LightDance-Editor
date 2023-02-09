import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByEditingControlFrameArgs } from "./args/GroupByEditingControlFrameArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { EditingControlFrameGroupBy } from "../../outputs/EditingControlFrameGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class GroupByEditingControlFrameResolver {
  @TypeGraphQL.Query(_returns => [EditingControlFrameGroupBy], {
    nullable: false
  })
  async groupByEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByEditingControlFrameArgs): Promise<EditingControlFrameGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
