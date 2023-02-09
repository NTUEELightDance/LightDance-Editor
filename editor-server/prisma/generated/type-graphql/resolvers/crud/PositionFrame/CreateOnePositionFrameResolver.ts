import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { CreateOnePositionFrameArgs } from "./args/CreateOnePositionFrameArgs";
import { PositionFrame } from "../../../models/PositionFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class CreateOnePositionFrameResolver {
  @TypeGraphQL.Mutation(_returns => PositionFrame, {
    nullable: false
  })
  async createOnePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOnePositionFrameArgs): Promise<PositionFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
