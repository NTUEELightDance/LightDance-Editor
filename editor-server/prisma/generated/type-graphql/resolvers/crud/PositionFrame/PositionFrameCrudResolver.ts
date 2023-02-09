import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePositionFrameArgs } from "./args/AggregatePositionFrameArgs";
import { CreateManyPositionFrameArgs } from "./args/CreateManyPositionFrameArgs";
import { CreateOnePositionFrameArgs } from "./args/CreateOnePositionFrameArgs";
import { DeleteManyPositionFrameArgs } from "./args/DeleteManyPositionFrameArgs";
import { DeleteOnePositionFrameArgs } from "./args/DeleteOnePositionFrameArgs";
import { FindFirstPositionFrameArgs } from "./args/FindFirstPositionFrameArgs";
import { FindFirstPositionFrameOrThrowArgs } from "./args/FindFirstPositionFrameOrThrowArgs";
import { FindManyPositionFrameArgs } from "./args/FindManyPositionFrameArgs";
import { FindUniquePositionFrameArgs } from "./args/FindUniquePositionFrameArgs";
import { FindUniquePositionFrameOrThrowArgs } from "./args/FindUniquePositionFrameOrThrowArgs";
import { GroupByPositionFrameArgs } from "./args/GroupByPositionFrameArgs";
import { UpdateManyPositionFrameArgs } from "./args/UpdateManyPositionFrameArgs";
import { UpdateOnePositionFrameArgs } from "./args/UpdateOnePositionFrameArgs";
import { UpsertOnePositionFrameArgs } from "./args/UpsertOnePositionFrameArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { PositionFrame } from "../../../models/PositionFrame";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregatePositionFrame } from "../../outputs/AggregatePositionFrame";
import { PositionFrameGroupBy } from "../../outputs/PositionFrameGroupBy";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class PositionFrameCrudResolver {
  @TypeGraphQL.Query(_returns => AggregatePositionFrame, {
    nullable: false
  })
  async aggregatePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePositionFrameArgs): Promise<AggregatePositionFrame> {
    return getPrismaFromContext(ctx).positionFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionFrame, {
    nullable: true
  })
  async deleteOnePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOnePositionFrameArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionFrame, {
    nullable: true
  })
  async findFirstPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstPositionFrameArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionFrame, {
    nullable: true
  })
  async findFirstPositionFrameOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstPositionFrameOrThrowArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [PositionFrame], {
    nullable: false
  })
  async positionFrames(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyPositionFrameArgs): Promise<PositionFrame[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionFrame, {
    nullable: true
  })
  async positionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniquePositionFrameArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionFrame, {
    nullable: true
  })
  async getPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniquePositionFrameOrThrowArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [PositionFrameGroupBy], {
    nullable: false
  })
  async groupByPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByPositionFrameArgs): Promise<PositionFrameGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionFrame, {
    nullable: true
  })
  async updateOnePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOnePositionFrameArgs): Promise<PositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionFrame, {
    nullable: false
  })
  async upsertOnePositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOnePositionFrameArgs): Promise<PositionFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionFrame.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
