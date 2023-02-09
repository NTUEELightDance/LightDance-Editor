import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateEditingPositionFrameArgs } from "./args/AggregateEditingPositionFrameArgs";
import { CreateManyEditingPositionFrameArgs } from "./args/CreateManyEditingPositionFrameArgs";
import { CreateOneEditingPositionFrameArgs } from "./args/CreateOneEditingPositionFrameArgs";
import { DeleteManyEditingPositionFrameArgs } from "./args/DeleteManyEditingPositionFrameArgs";
import { DeleteOneEditingPositionFrameArgs } from "./args/DeleteOneEditingPositionFrameArgs";
import { FindFirstEditingPositionFrameArgs } from "./args/FindFirstEditingPositionFrameArgs";
import { FindFirstEditingPositionFrameOrThrowArgs } from "./args/FindFirstEditingPositionFrameOrThrowArgs";
import { FindManyEditingPositionFrameArgs } from "./args/FindManyEditingPositionFrameArgs";
import { FindUniqueEditingPositionFrameArgs } from "./args/FindUniqueEditingPositionFrameArgs";
import { FindUniqueEditingPositionFrameOrThrowArgs } from "./args/FindUniqueEditingPositionFrameOrThrowArgs";
import { GroupByEditingPositionFrameArgs } from "./args/GroupByEditingPositionFrameArgs";
import { UpdateManyEditingPositionFrameArgs } from "./args/UpdateManyEditingPositionFrameArgs";
import { UpdateOneEditingPositionFrameArgs } from "./args/UpdateOneEditingPositionFrameArgs";
import { UpsertOneEditingPositionFrameArgs } from "./args/UpsertOneEditingPositionFrameArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateEditingPositionFrame } from "../../outputs/AggregateEditingPositionFrame";
import { EditingPositionFrameGroupBy } from "../../outputs/EditingPositionFrameGroupBy";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class EditingPositionFrameCrudResolver {
  @TypeGraphQL.Query(_returns => AggregateEditingPositionFrame, {
    nullable: false
  })
  async aggregateEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateEditingPositionFrameArgs): Promise<AggregateEditingPositionFrame> {
    return getPrismaFromContext(ctx).editingPositionFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyEditingPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingPositionFrame, {
    nullable: false
  })
  async createOneEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneEditingPositionFrameArgs): Promise<EditingPositionFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyEditingPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingPositionFrame, {
    nullable: true
  })
  async deleteOneEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOneEditingPositionFrameArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async findFirstEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEditingPositionFrameArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async findFirstEditingPositionFrameOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEditingPositionFrameOrThrowArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [EditingPositionFrame], {
    nullable: false
  })
  async editingPositionFrames(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyEditingPositionFrameArgs): Promise<EditingPositionFrame[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async editingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingPositionFrameArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingPositionFrame, {
    nullable: true
  })
  async getEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingPositionFrameOrThrowArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [EditingPositionFrameGroupBy], {
    nullable: false
  })
  async groupByEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByEditingPositionFrameArgs): Promise<EditingPositionFrameGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyEditingPositionFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingPositionFrame, {
    nullable: true
  })
  async updateOneEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneEditingPositionFrameArgs): Promise<EditingPositionFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingPositionFrame, {
    nullable: false
  })
  async upsertOneEditingPositionFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOneEditingPositionFrameArgs): Promise<EditingPositionFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingPositionFrame.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
