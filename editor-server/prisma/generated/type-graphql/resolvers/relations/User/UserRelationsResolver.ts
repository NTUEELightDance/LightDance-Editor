import * as TypeGraphQL from "type-graphql";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { EditingPositionFrame } from "../../../models/EditingPositionFrame";
import { User } from "../../../models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => User)
export class UserRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => EditingPositionFrame, {
    nullable: true
  })
  async editingPositionFrameId(@TypeGraphQL.Root() user: User, @TypeGraphQL.Ctx() ctx: any): Promise<EditingPositionFrame | null> {
    return getPrismaFromContext(ctx).user.findUnique({
      where: {
        id: user.id,
      },
    }).editingPositionFrameId({});
  }

  @TypeGraphQL.FieldResolver(_type => EditingControlFrame, {
    nullable: true
  })
  async editingControlFrameId(@TypeGraphQL.Root() user: User, @TypeGraphQL.Ctx() ctx: any): Promise<EditingControlFrame | null> {
    return getPrismaFromContext(ctx).user.findUnique({
      where: {
        id: user.id,
      },
    }).editingControlFrameId({});
  }
}
