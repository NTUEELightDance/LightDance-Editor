import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateEditingPositionFrameArgs } from "./args/AggregateEditingPositionFrameArgs";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { AggregateEditingPositionFrame } from "../../outputs/AggregateEditingPositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class AggregateEditingPositionFrameResolver {
  @TypeGraphQL.Query(_returns => AggregateEditingPositionFrame, {
    nullable: false
  })
  async aggregateEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateEditingPositionFrameArgs): Promise<AggregateEditingPositionFrame> {
    return getPrismaFromContext(ctx).editingPositionFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
