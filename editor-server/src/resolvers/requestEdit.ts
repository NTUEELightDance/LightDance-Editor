import { Resolver, Ctx, Mutation, Arg, Int } from "type-graphql";

import { TContext } from "../types/global";
import { RequestEditResponse } from "./response/requestEditResponse";

@Resolver()
export class RequestEditResolver {
  @Mutation((returns) => RequestEditResponse)
  async RequestEditControl(
    @Arg("FrameID", (type) => Int) frameID: number,
    @Ctx() ctx: TContext
  ) {
    const checkEditingControlFrame =
      await ctx.prisma.editingControlFrame.findFirst({
        where: { frameId: frameID },
      });
    const existFrame = await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
    });
    if (!existFrame) throw new Error(`frame id ${frameID} not found`);
    if (checkEditingControlFrame === null) {
      await ctx.prisma.editingControlFrame.update({
        where: { userId: ctx.userId },
        data: { frameId: frameID },
      });
      return { editing: ctx.userId, ok: true };
    } else {
      if (checkEditingControlFrame.userId !== ctx.userId) {
        return { editing: checkEditingControlFrame.userId, ok: false };
      }
      return { editing: checkEditingControlFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async RequestEditPosition(
    @Arg("FrameID", (type) => Int) frameID: number,
    @Ctx() ctx: TContext
  ) {
    const checkEditingPositionFrame =
      await ctx.prisma.editingPositionFrame.findFirst({
        where: { frameId: frameID },
      });
    const existFrame = await ctx.prisma.positionFrame.findFirst({
      where: { id: frameID },
    });
    if (!existFrame) throw new Error(`frame id ${frameID} not found`);
    if (checkEditingPositionFrame === null) {
      await ctx.prisma.editingPositionFrame.update({
        where: { userId: ctx.userId },
        data: { frameId: frameID },
      });
      return { editing: ctx.userId, ok: true };
    } else {
      if (checkEditingPositionFrame.userId !== ctx.userId) {
        return { editing: checkEditingPositionFrame.userId, ok: false };
      }
      return { editing: checkEditingPositionFrame.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async RequestEditLEDEffect(
    @Arg("LEDEffectID", (type) => Int) lEDEffectID: number,
    @Ctx() ctx: TContext
  ) {
    const checkEditingLEDEffect = await ctx.prisma.editingLEDEffect.findFirst({
      where: { LEDEffectId: lEDEffectID },
    });
    const existLEDEffect = await ctx.prisma.lEDEffect.findFirst({
      where: { id: lEDEffectID },
    });
    if (!existLEDEffect) throw new Error(`frame id ${lEDEffectID} not found`);
    if (checkEditingLEDEffect === null) {
      await ctx.prisma.editingLEDEffect.update({
        where: { userId: ctx.userId },
        data: { LEDEffectId: lEDEffectID },
      });
      return { editing: ctx.userId, ok: true };
    } else {
      if (checkEditingLEDEffect.userId !== ctx.userId) {
        return { editing: checkEditingLEDEffect.userId, ok: false };
      }
      return { editing: checkEditingLEDEffect.userId, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditPosition(
    @Arg("FrameID", (type) => Int) frameID: number,
    @Ctx() ctx: TContext
  ) {
    const existFrame = await ctx.prisma.positionFrame.findFirst({
      where: { id: frameID },
    });
    if (!existFrame) throw new Error(`frame id ${frameID} not found`);
    const positionFrame = await ctx.prisma.editingPositionFrame.updateMany({
      where: { frameId: frameID },
      data: { frameId: null },
    });
    return { editing: null, ok: true };
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditControl(
    @Arg("FrameID", (type) => Int) frameID: number,
    @Ctx() ctx: TContext
  ) {
    const existFrame = await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
    });
    if (!existFrame) throw new Error(`frame id ${frameID} not found`);
    const controlFrame = await ctx.prisma.editingControlFrame.updateMany({
      where: { frameId: frameID },
      data: { frameId: null },
    });
    return { editing: null, ok: true };
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditLEDEffect(
    @Arg("LEDEffectID", (type) => Int) lEDEffectID: number,
    @Ctx() ctx: TContext
  ) {
    const existLEDEffect = await ctx.prisma.lEDEffect.findFirst({
      where: { id: lEDEffectID },
    });
    if (!existLEDEffect) throw new Error(`frame id ${lEDEffectID} not found`);
    const LEDEffect = await ctx.prisma.editingLEDEffect.updateMany({
      where: { LEDEffectId: lEDEffectID },
      data: { LEDEffectId: null },
    });
    return { editing: null, ok: true };
  }
}
