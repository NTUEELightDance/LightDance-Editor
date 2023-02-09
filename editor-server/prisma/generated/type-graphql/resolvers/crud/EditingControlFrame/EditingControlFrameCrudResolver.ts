import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateEditingControlFrameArgs } from "./args/AggregateEditingControlFrameArgs";
import { CreateManyEditingControlFrameArgs } from "./args/CreateManyEditingControlFrameArgs";
import { CreateOneEditingControlFrameArgs } from "./args/CreateOneEditingControlFrameArgs";
import { DeleteManyEditingControlFrameArgs } from "./args/DeleteManyEditingControlFrameArgs";
import { DeleteOneEditingControlFrameArgs } from "./args/DeleteOneEditingControlFrameArgs";
import { FindFirstEditingControlFrameArgs } from "./args/FindFirstEditingControlFrameArgs";
import { FindFirstEditingControlFrameOrThrowArgs } from "./args/FindFirstEditingControlFrameOrThrowArgs";
import { FindManyEditingControlFrameArgs } from "./args/FindManyEditingControlFrameArgs";
import { FindUniqueEditingControlFrameArgs } from "./args/FindUniqueEditingControlFrameArgs";
import { FindUniqueEditingControlFrameOrThrowArgs } from "./args/FindUniqueEditingControlFrameOrThrowArgs";
import { GroupByEditingControlFrameArgs } from "./args/GroupByEditingControlFrameArgs";
import { UpdateManyEditingControlFrameArgs } from "./args/UpdateManyEditingControlFrameArgs";
import { UpdateOneEditingControlFrameArgs } from "./args/UpdateOneEditingControlFrameArgs";
import { UpsertOneEditingControlFrameArgs } from "./args/UpsertOneEditingControlFrameArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateEditingControlFrame } from "../../outputs/AggregateEditingControlFrame";
import { EditingControlFrameGroupBy } from "../../outputs/EditingControlFrameGroupBy";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class EditingControlFrameCrudResolver {
  @TypeGraphQL.Query(_returns => AggregateEditingControlFrame, {
    nullable: false
  })
  async aggregateEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateEditingControlFrameArgs): Promise<AggregateEditingControlFrame> {
    return getPrismaFromContext(ctx).editingControlFrame.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyEditingControlFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingControlFrame, {
    nullable: false
  })
  async createOneEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneEditingControlFrameArgs): Promise<EditingControlFrame> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyEditingControlFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingControlFrame, {
    nullable: true
  })
  async deleteOneEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOneEditingControlFrameArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingControlFrame, {
    nullable: true
  })
  async findFirstEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEditingControlFrameArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Query(_returns => [EditingControlFrame], {
    nullable: false
  })
  async editingControlFrames(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyEditingControlFrameArgs): Promise<EditingControlFrame[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingControlFrame, {
    nullable: true
  })
  async editingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingControlFrameArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => EditingControlFrame, {
    nullable: true
  })
  async getEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueEditingControlFrameOrThrowArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyEditingControlFrameArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => EditingControlFrame, {
    nullable: true
  })
  async updateOneEditingControlFrame(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneEditingControlFrameArgs): Promise<EditingControlFrame | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).editingControlFrame.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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
