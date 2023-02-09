import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateControlDataArgs } from "./args/AggregateControlDataArgs";
import { ControlData } from "../../../models/ControlData";
import { AggregateControlData } from "../../outputs/AggregateControlData";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlData)
export class AggregateControlDataResolver {
  @TypeGraphQL.Query(_returns => AggregateControlData, {
    nullable: false
  })
  async aggregateControlData(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateControlDataArgs): Promise<AggregateControlData> {
    return getPrismaFromContext(ctx).controlData.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
