import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePositionDataArgs } from "./args/AggregatePositionDataArgs";
import { PositionData } from "../../../models/PositionData";
import { AggregatePositionData } from "../../outputs/AggregatePositionData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionData)
export class AggregatePositionDataResolver {
  @TypeGraphQL.Query(_returns => AggregatePositionData, {
    nullable: false
  })
  async aggregatePositionData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePositionDataArgs): Promise<AggregatePositionData> {
    return getPrismaFromContext(ctx).positionData.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
