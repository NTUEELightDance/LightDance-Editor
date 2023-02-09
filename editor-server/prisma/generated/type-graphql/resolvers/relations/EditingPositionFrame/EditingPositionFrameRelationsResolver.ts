import * as TypeGraphQL from "type-graphql";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { PositionFrame } from "../../../models/PositionFrame";
import { User } from "../../../models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingPositionFrame)
export class EditingPositionFrameRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => User, {
    nullable: false
  })
  async user(@TypeGraphQL.Root() editingPositionFrame: EditingPositionFrame, @TypeGraphQL.Ctx() ctx: any): Promise<User> {
    return getPrismaFromContext(ctx).editingPositionFrame.findUnique({
      where: {
        userId: editingPositionFrame.userId,
      },
    }).user({});
  }

  @TypeGraphQL.FieldResolver(_type => PositionFrame, {
    nullable: true
  })
  async editingFrame(@TypeGraphQL.Root() editingPositionFrame: EditingPositionFrame, @TypeGraphQL.Ctx() ctx: any): Promise<PositionFrame | null> {
    return getPrismaFromContext(ctx).editingPositionFrame.findUnique({
      where: {
        userId: editingPositionFrame.userId,
      },
    }).editingFrame({});
  }
}
