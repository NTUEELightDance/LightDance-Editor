import { Resolver, Query, Arg, Ctx, Mutation } from "type-graphql";

import { LEDMap } from "./types/ledEffectMap";
import { AddLEDInput, DeleteLEDInput } from "./inputs/led";
import {
  LEDEffectResponse,
  DeleteLEDEffectResponse,
} from "./response/ledEffectResponse";
import { IControl, IControlFrame, TContext } from "../types/global";

@Resolver()
export class LEDResolver {
  @Query((returns) => LEDMap)
  async LEDMap(@Ctx() ctx: TContext) {
    const allPart = await ctx.db.Part.find({ type: "LED" });
    return { LEDMap: allPart };
  }

  @Mutation((returns) => LEDEffectResponse)
  async addLED(@Arg("input") input: AddLEDInput, @Ctx() ctx: TContext) {
    const { partName, effectName, repeat, effects } = input;

    // check part validity
    const part = ctx.db.Part.findOne({ name: partName, type: "LED" });
    if (!part) {
      return Object.assign(
        {
          partName,
          effectName: ",",
          repeat: -1,
          effects: [],
        },
        { ok: false, msg: "effectName exist." }
      );
    }

    // check overlapped
    const exist = await ctx.db.LED.findOne({ partName, effectName });
    if (exist)
      return Object.assign(exist, { ok: false, msg: "effectName exist." });

    await new ctx.db.LED(input).save();

    return Object.assign(input, { ok: true });
  }

  @Mutation((returns) => DeleteLEDEffectResponse)
  async deleteLED(@Arg("input") input: DeleteLEDInput, @Ctx() ctx: TContext) {
    const { partName, effectName } = input;

    // check exist
    const exist = await ctx.db.LED.findOne({ partName, effectName });
    if (!exist)
      return {
        ok: false,
        msg: `Effect ${effectName} on part ${partName} not found`,
      };

    const checkControl: IControl[] = await ctx.db.Control.find({
      "value.src": effectName,
    });
    if (checkControl.length != 0) {
      const allControlFrame: IControlFrame[] = await ctx.db.ControlFrame.find(
        {},
        "_id"
      ).sort({
        start: 1,
      });
      const allControlFrameID = allControlFrame.map((Obj) => String(Obj._id));
      const ids: number[] = [];
      checkControl.map((controlObj) => {
        const frame = String(controlObj.frame);
        const id = allControlFrameID.indexOf(frame);
        if (ids.indexOf(id) === -1) {
          ids.push(id);
        }
      });
      ids.sort((a, b) => a - b);
      return {
        ok: false,
        msg: `effect ${effectName} is used in ${ids}`,
      };
    }

    await ctx.db.LED.deleteOne({ effectName, partName });
    return { ok: true };
  }
}
