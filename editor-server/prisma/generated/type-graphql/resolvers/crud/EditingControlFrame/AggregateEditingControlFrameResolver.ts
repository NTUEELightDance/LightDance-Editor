import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateEditingControlFrameArgs } from "./args/AggregateEditingControlFrameArgs";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { AggregateEditingControlFrame } from "../../outputs/AggregateEditingControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class AggregateEditingControlFrameResolver {
  @TypeGraphQL.Query(_returns => AggregateEditingControlFrame, {
    nullable: false
  })
  async aggregateEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateEditingControlFrameArgs): Promise<AggregateEditingControlFrame> {
    return getPrismaFromContext(ctx).editingControlFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
