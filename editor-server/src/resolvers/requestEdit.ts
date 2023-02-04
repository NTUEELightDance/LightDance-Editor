import {
  Resolver,
  Ctx,
  Mutation,
  Arg,
} from "type-graphql";

import { TContext } from "../types/global";
import { RequestEditResponse } from "./response/requestEditResponse";

@Resolver()
export class RequestEditResolver {
  @Mutation((returns) => RequestEditResponse)
  async RequestEditControl(@Arg("FrameID") frameID: string, @Ctx() ctx: TContext) {
    const checkEditingControlFrame = await ctx.prisma.editingControlFrame.findFirst({where: {frameId: Number(frameID)}});
    if (checkEditingControlFrame === null) {
      const updateEditing = await ctx.prisma.editingControlFrame.updateMany({where: {userId: Number(ctx.userID)}, data: {frameId: Number(frameID)}});
      return { editing: ctx.userID, ok: true };
    } else {
      if (checkEditingControlFrame.userId !== Number(ctx.userID)) {
        return { editing: checkEditingControlFrame.userId, ok: false };
      }
      return { editing: checkEditingControlFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async RequestEditPosition(@Arg("FrameID") frameID: string, @Ctx() ctx: TContext) {
    const checkEditingPositionFrame = await ctx.prisma.editingPositionFrame.findFirst({where: {frameId: Number(frameID)}});
    if (checkEditingPositionFrame === null) {
      const updateEditing = await ctx.prisma.editingPositionFrame.updateMany({where: {userId: Number(ctx.userID)}, data: {frameId: Number(frameID)}});
      return { editing: ctx.userID, ok: true };
    } else {
      if (checkEditingPositionFrame.userId !== Number(ctx.userID)) {
        return { editing: checkEditingPositionFrame.userId, ok: false };
      }
      return { editing: checkEditingPositionFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditPosition(@Arg("FrameID") frameID: string, @Ctx() ctx: TContext) {
    const positionFrame = await ctx.prisma.editingPositionFrame.updateMany({where: {frameId: Number(frameID)}, data: {frameId: null}});
    return { editing: null, ok: true };
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditControl(@Arg("FrameID") frameID: string, @Ctx() ctx: TContext) {
    const controlFrame = await ctx.prisma.editingControlFrame.updateMany({where: {frameId: Number(frameID)}, data: {frameId: null}});
    return { editing: null, ok: true };
  }
}

