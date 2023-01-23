import { Resolver, Ctx, Mutation, Arg } from "type-graphql";

import { TContext } from "../types/global";
import { RequestEditResponse } from "./response/requestEditResponse";

@Resolver()
export class RequestEditResolver {
  @Mutation((returns) => RequestEditResponse)
  async RequestEditControl(
    @Arg("FrameID") frameID: string,
    @Ctx() ctx: TContext
  ) {
    const controlFrame = await ctx.db.ControlFrame.findOne({ id: frameID });
    if (!controlFrame.editing) {
      await ctx.db.ControlFrame.findOneAndUpdate(
        { editing: ctx.username },
        { editing: null }
      );
      await ctx.db.ControlFrame.findOneAndUpdate(
        { id: frameID },
        { editing: ctx.username }
      );
      return { editing: ctx.username, ok: true };
    } else {
      if (controlFrame.editing !== ctx.username) {
        return { editing: controlFrame.editing, ok: false };
      }
      return { editing: controlFrame.editing, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async RequestEditPosition(
    @Arg("FrameID") frameID: string,
    @Ctx() ctx: TContext
  ) {
    const positionFrame = await ctx.db.PositionFrame.findOne({ id: frameID });
    if (!positionFrame.editing) {
      await ctx.db.PositionFrame.findOneAndUpdate(
        { editing: ctx.username },
        { editing: null }
      );
      await ctx.db.PositionFrame.findOneAndUpdate(
        { id: frameID },
        { editing: ctx.username }
      );
      return { editing: ctx.username, ok: true };
    } else {
      if (positionFrame.editing !== ctx.username) {
        return { editing: positionFrame.editing, ok: false };
      }
      return { editing: positionFrame.editing, ok: true };
    }
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditPosition(
    @Arg("FrameID") frameID: string,
    @Ctx() ctx: TContext
  ) {
    const positionFrame = await ctx.db.PositionFrame.findOneAndUpdate(
      { id: frameID },
      { editing: null }
    );
    return { editing: null, ok: true };
  }

  @Mutation((returns) => RequestEditResponse)
  async CancelEditControl(
    @Arg("FrameID") frameID: string,
    @Ctx() ctx: TContext
  ) {
    const controlFrame = await ctx.db.ControlFrame.findOneAndUpdate(
      { id: frameID },
      { editing: null }
    );
    return { editing: null, ok: true };
  }
}
