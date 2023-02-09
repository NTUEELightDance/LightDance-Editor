import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePositionDataArgs } from "./args/AggregatePositionDataArgs";
import { CreateManyPositionDataArgs } from "./args/CreateManyPositionDataArgs";
import { CreateOnePositionDataArgs } from "./args/CreateOnePositionDataArgs";
import { DeleteManyPositionDataArgs } from "./args/DeleteManyPositionDataArgs";
import { DeleteOnePositionDataArgs } from "./args/DeleteOnePositionDataArgs";
import { FindFirstPositionDataArgs } from "./args/FindFirstPositionDataArgs";
import { FindFirstPositionDataOrThrowArgs } from "./args/FindFirstPositionDataOrThrowArgs";
import { FindManyPositionDataArgs } from "./args/FindManyPositionDataArgs";
import { FindUniquePositionDataArgs } from "./args/FindUniquePositionDataArgs";
import { FindUniquePositionDataOrThrowArgs } from "./args/FindUniquePositionDataOrThrowArgs";
import { GroupByPositionDataArgs } from "./args/GroupByPositionDataArgs";
import { UpdateManyPositionDataArgs } from "./args/UpdateManyPositionDataArgs";
import { UpdateOnePositionDataArgs } from "./args/UpdateOnePositionDataArgs";
import { UpsertOnePositionDataArgs } from "./args/UpsertOnePositionDataArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { PositionData } from "../../../models/PositionData";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregatePositionData } from "../../outputs/AggregatePositionData";
import { PositionDataGroupBy } from "../../outputs/PositionDataGroupBy";

@TypeGraphQL.Resolver(_of => PositionData)
export class PositionDataCrudResolver {
  @TypeGraphQL.Query(_returns => AggregatePositionData, {
    nullable: false
  })
  async aggregatePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePositionDataArgs): Promise<AggregatePositionData> {
    return getPrismaFromContext(ctx).positionData.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyPositionDataArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionData, {
    nullable: false
  })
  async createOnePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOnePositionDataArgs): Promise<PositionData> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyPositionDataArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionData, {
    nullable: true
  })
  async deleteOnePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOnePositionDataArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionData, {
    nullable: true
  })
  async findFirstPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstPositionDataArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionData, {
    nullable: true
  })
  async findFirstPositionDataOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstPositionDataOrThrowArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [PositionData], {
    nullable: false
  })
  async findManyPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyPositionDataArgs): Promise<PositionData[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionData, {
    nullable: true
  })
  async findUniquePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniquePositionDataArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => PositionData, {
    nullable: true
  })
  async findUniquePositionDataOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniquePositionDataOrThrowArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [PositionDataGroupBy], {
    nullable: false
  })
  async groupByPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByPositionDataArgs): Promise<PositionDataGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyPositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyPositionDataArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionData, {
    nullable: true
  })
  async updateOnePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOnePositionDataArgs): Promise<PositionData | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => PositionData, {
    nullable: false
  })
  async upsertOnePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOnePositionDataArgs): Promise<PositionData> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).positionData.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
