import * as TypeGraphQL from "type-graphql";
import { ControlFrame } from "../../../models/ControlFrame";
import { EditingControlFrame } from "../../../models/EditingControlFrame";
import { User } from "../../../models/User";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EditingControlFrame)
export class EditingControlFrameRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => User, {
    nullable: false
  })
  async user(@TypeGraphQL.Root() editingControlFrame: EditingControlFrame, @TypeGraphQL.Ctx() ctx: any): Promise<User> {
    return getPrismaFromContext(ctx).editingControlFrame.findUnique({
      where: {
        userId: editingControlFrame.userId,
      },
    }).user({});
  }

  @TypeGraphQL.FieldResolver(_type => ControlFrame, {
    nullable: true
  })
  async editingFrame(@TypeGraphQL.Root() editingControlFrame: EditingControlFrame, @TypeGraphQL.Ctx() ctx: any): Promise<ControlFrame | null> {
    return getPrismaFromContext(ctx).editingControlFrame.findUnique({
      where: {
        userId: editingControlFrame.userId,
      },
    }).editingFrame({});
  }
}
