import * as TypeGraphQL from "type-graphql";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { PositionData } from "../../../models/PositionData";
import { PositionFrame } from "../../../models/PositionFrame";
import { PositionFramePositionDatasArgs } from "./args/PositionFramePositionDatasArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => PositionFrame)
export class PositionFrameRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => EditingPositionFrame, {
    nullable: true
  })
  async editing(@TypeGraphQL.Root() positionFrame: PositionFrame, @TypeGraphQL.Ctx() ctx: any): Promise<EditingPositionFrame | null> {
    return getPrismaFromContext(ctx).positionFrame.findUnique({
      where: {
        id: positionFrame.id,
      },
    }).editing({});
  }

  @TypeGraphQL.FieldResolver(_type => [PositionData], {
    nullable: false
  })
  async positionDatas(@TypeGraphQL.Root() positionFrame: PositionFrame, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: PositionFramePositionDatasArgs): Promise<PositionData[]> {
    return getPrismaFromContext(ctx).positionFrame.findUnique({
      where: {
        id: positionFrame.id,
      },
    }).positionDatas(args);
  }
}
