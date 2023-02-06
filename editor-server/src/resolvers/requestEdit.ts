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
  async RequestEditControl(@Arg("FrameID") frameID: number, @Ctx() ctx: TContext) {
    const checkEditingControlFrame = await ctx.prisma.editingControlFrame.findFirst({where: {frameId: frameID}});
    const existFrame = await ctx.prisma.controlFrame.findFirst({where: {id: frameID}});
    if(!existFrame) throw new Error(`frame id ${frameID} not found`);
    if (checkEditingControlFrame === null) {
      await ctx.prisma.editingControlFrame.update({where: {userId: ctx.userID}, data: {frameId: frameID}});
      return { editing: ctx.userID, ok: true };
    } else {
      if (checkEditingControlFrame.userId !== ctx.userID) {
        return { editing: checkEditingControlFrame.userId, ok: false };
      }
      return { editing: checkEditingControlFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async RequestEditPosition(@Arg("FrameID") frameID: number, @Ctx() ctx: TContext) {
    const checkEditingPositionFrame = await ctx.prisma.editingPositionFrame.findFirst({where: {frameId: frameID}});
    const existFrame = await ctx.prisma.positionFrame.findFirst({where: {id: frameID}});
    if(!existFrame) throw new Error(`frame id ${frameID} not found`);
    if (checkEditingPositionFrame === null) {
      const updateEditing = await ctx.prisma.editingPositionFrame.update({where: {userId: ctx.userID}, data: {frameId: frameID}});
      return { editing: ctx.userID, ok: true };
    } else {
      if (checkEditingPositionFrame.userId !== ctx.userID) {
        return { editing: checkEditingPositionFrame.userId, ok: false };
      }
      return { editing: checkEditingPositionFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditPosition(@Arg("FrameID") frameID: number, @Ctx() ctx: TContext) {
    const positionFrame = await ctx.prisma.editingPositionFrame.updateMany({where: {frameId: frameID}, data: {frameId: null}});
    return { editing: null, ok: true };
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditControl(@Arg("FrameID") frameID: number, @Ctx() ctx: TContext) {
    const controlFrame = await ctx.prisma.editingControlFrame.updateMany({where: {frameId: frameID}, data: {frameId: null}});
    return { editing: null, ok: true };
  }
}

