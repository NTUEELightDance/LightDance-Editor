import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Publisher,
  PubSub,
} from "type-graphql";
import { LEDMap } from "./types/ledEffectMap";
import { AddLEDInput, DeleteLEDInput } from "./inputs/led";
import {
  LEDEffectResponse,
  DeleteLEDEffectResponse,
} from "./response/ledEffectResponse";

@Resolver()
export class LEDResolver {
  @Query((returns) => LEDMap)
  async LEDMap(@Ctx() ctx: any) {
    const allPart = await ctx.db.Part.find({ type: "LED" });
    return { LEDMap: allPart };
  }

  @Mutation((returns) => LEDEffectResponse)
  async addLED(@Arg("input") input: AddLEDInput, @Ctx() ctx: any) {
    const { partName, repeat, effects } = input;
    let {effectName} = input;
    if (!effectName) {
      effectName = "";
    }

    // check part validity
    const part = ctx.db.Part.findOne({ name: partName, type: "LED" });
    if (!part) {
      return Object.assign(
        {
          partName,
          effectName: "",
          repeat: -1,
          effects: [],
        },
        { ok: false, msg: "part not found." }
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
  async deleteLED(@Arg("input") input: DeleteLEDInput, @Ctx() ctx: any) {
    let { partName, effectName } = input;
    if (!effectName) {
      effectName = "";
    }

    // check exist
    const exist = await ctx.db.LED.findOne({ partName, effectName });
    if (!exist)
      return {
        ok: false,
        msg: `Effect ${effectName} on part ${partName} not found`,
      };

    await ctx.db.LED.deleteOne({ effectName, partName });
    return { ok: true };
  }
}
