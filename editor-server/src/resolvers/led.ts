import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  PubSub,
  Publisher,
} from "type-graphql";

import { LEDMap } from "./types/ledEffectMap";
import { DeleteLEDInput } from "./inputs/led";
import {
  LEDEffectResponse,
  DeleteLEDEffectResponse,
} from "./response/ledEffectResponse";
import { TContext } from "../types/global";
import {
  LEDEffectCreateInput,
} from "../../prisma/generated/type-graphql";
import { Topic } from "./subscriptions/topic";
import { LEDPayload, ledMutation } from "./subscriptions/led";

@Resolver()
export class LEDResolver {
  @Query((returns) => LEDMap)
  async LEDMap(@Ctx() ctx: TContext) {
    const allPart = await ctx.prisma.part.findMany({ where: { type: "LED" } });
    return { LEDMap: allPart };
  }

  @Mutation((returns) => LEDEffectResponse)
  async addLED(
    @PubSub(Topic.LEDRecord)
    publishLEDRecord: Publisher<LEDPayload>,
    @Arg("input") input: LEDEffectCreateInput,
    @Ctx() ctx: TContext
  ) {
    const { name, partName, repeat, frames } = input;

    // check part validity
    const part = await ctx.prisma.part.findMany({
      where: { name: partName, type: "LED" },
    });
    if (part.length === 0) {
      return Object.assign({ ok: false, msg: "no corresponding part." });
    }

    // check overlapped
    const exist = await ctx.prisma.lEDEffect.findMany({
      where: { name: name, partName: partName },
    });
    if (exist.length !== 0)
      return Object.assign({ ok: false, msg: "effectName exist." });

    const newLED = await ctx.prisma.lEDEffect.create({
      data: input,
    });

    const recordPayload: LEDPayload = {
      mutation: ledMutation.CREATED,
      editBy: ctx.userId,
      partName,
      effectName: name,
      data: newLED,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({ ok: true });
  }

  @Mutation((returns) => LEDEffectResponse)
  async editLED(
    @PubSub(Topic.LEDRecord)
    publishLEDRecord: Publisher<LEDPayload>,
    @Arg("input") input: LEDEffectCreateInput,
    @Ctx() ctx: TContext
  ) {
    const { name, partName, repeat, frames } = input;

    // check overlapped
    const exist = await ctx.prisma.lEDEffect.findFirst({
      where: { name: name, partName: partName },
    });
    if (!exist)
      return Object.assign({ ok: false, msg: "effectName do not exist." });

    const target = await ctx.prisma.lEDEffect.update({
      where: {
        name_partName: {
          name,
          partName,
        },
      },
      data: input,
    });

    const recordPayload: LEDPayload = {
      mutation: ledMutation.UPDATED,
      editBy: ctx.userId,
      partName,
      effectName: name,
      data: target,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({
      ok: true,
      msg: "update success",
      partName,
      effectName: name,
      repeat: target.repeat,
      effects: target.frames,
    });
  }

  @Mutation((returns) => DeleteLEDEffectResponse)
  async deleteLED(
    @PubSub(Topic.LEDRecord) publishLEDRecord: Publisher<LEDPayload>,
    @Arg("input") input: DeleteLEDInput,
    @Ctx() ctx: TContext
  ) {
    const { partName, effectName } = input;

    // check exist
    const exist = await ctx.prisma.lEDEffect.findFirst({
      where: { name: effectName, partName: partName },
    });
    if (!exist)
      return {
        ok: false,
        msg: `Effect ${effectName} on part ${partName} not found`,
      };

    const checkControl = await ctx.prisma.controlData.findMany({
      where: { value: { path: ["src"], equals: effectName } },
    });
    if (checkControl.length != 0) {
      let checkControlFrames: number[] = checkControl.map(
        (control) => control.frameId
      );
      checkControlFrames = checkControlFrames.sort(function (a, b) {
        return a - b;
      });
      let frame = 0;
      const ids: number[] = [];
      checkControlFrames.map((controlFrame) => {
        if (controlFrame !== frame) {
          ids.push(controlFrame);
          frame = controlFrame;
        }
      });
      return {
        ok: false,
        msg: `effect ${effectName} is used in ${ids}`,
      };
    }

    await ctx.prisma.lEDEffect.deleteMany({
      where: { name: effectName, partName: partName },
    });
    const recordPayload: LEDPayload = {
      mutation: ledMutation.DELETED,
      editBy: ctx.userId,
      partName,
      effectName,
    };
    await publishLEDRecord(recordPayload);
    return { ok: true };
  }
}
