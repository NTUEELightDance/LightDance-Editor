import * as TypeGraphQL from "type-graphql";
import { ControlData } from "../../../models/ControlData";
import { ControlFrame } from "../../../models/ControlFrame";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { ControlFrameControlDatasArgs } from "./args/ControlFrameControlDatasArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ControlFrame)
export class ControlFrameRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => EditingControlFrame, {
    nullable: true
  })
  async editing(@TypeGraphQL.Root() controlFrame: ControlFrame, @TypeGraphQL.Ctx() ctx: any): Promise<EditingControlFrame | null> {
    return getPrismaFromContext(ctx).controlFrame.findUnique({
      where: {
        id: controlFrame.id,
      },
    }).editing({});
  }

  @TypeGraphQL.FieldResolver(_type => [ControlData], {
    nullable: false
  })
  async controlDatas(@TypeGraphQL.Root() controlFrame: ControlFrame, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: ControlFrameControlDatasArgs): Promise<ControlData[]> {
    return getPrismaFromContext(ctx).controlFrame.findUnique({
      where: {
        id: controlFrame.id,
      },
    }).controlDatas(args);
  }
}
