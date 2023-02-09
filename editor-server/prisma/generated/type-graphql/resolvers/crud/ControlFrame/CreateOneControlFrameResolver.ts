import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { CreateOneControlFrameArgs } from "./args/CreateOneControlFrameArgs";
import { ControlFrame } from "../../../models/ControlFrame";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlFrame)
export class CreateOneControlFrameResolver {
  @TypeGraphQL.Mutation(_returns => ControlFrame, {
    nullable: false
  })
  async createOneControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneControlFrameArgs): Promise<ControlFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).controlFrame.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
