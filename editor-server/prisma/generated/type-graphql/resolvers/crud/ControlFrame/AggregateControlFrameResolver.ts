import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateControlFrameArgs } from "./args/AggregateControlFrameArgs";
import { ControlFrame } from "../../../models/ControlFrame";
import { AggregateControlFrame } from "../../outputs/AggregateControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlFrame)
export class AggregateControlFrameResolver {
  @TypeGraphQL.Query(_returns => AggregateControlFrame, {
    nullable: false
  })
  async aggregateControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateControlFrameArgs): Promise<AggregateControlFrame> {
    return getPrismaFromContext(ctx).controlFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
