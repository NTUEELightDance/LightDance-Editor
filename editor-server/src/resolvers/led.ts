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
import { EditLEDInput } from "./inputs/led";
import { TContext } from "../types/global";
import { LEDEffectCreateInput } from "../../prisma/generated/type-graphql";
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
  async addLEDEffect(
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
      return Object.assign({
        partName: partName,
        effectName: name,
        repeat: repeat,
        ok: false,
        msg: "no corresponding part.",
      });
    }

    // check overlapped
    const exist = await ctx.prisma.lEDEffect.findMany({
      where: { name: name, partName: partName },
    });
    if (exist.length !== 0)
      return Object.assign({
        partName: partName,
        effectName: name,
        repeat: repeat,
        ok: false,
        msg: "effectName exist.",
      });

    const newLED = await ctx.prisma.lEDEffect.create({
      data: {
        name: name,
        partName: partName,
        repeat: repeat,
        frames: frames?.set,
      },
    });

    const recordPayload: LEDPayload = {
      mutation: ledMutation.CREATED,
      editBy: ctx.userId,
      partName,
      effectName: name,
      data: newLED,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({
      partName: partName,
      effectName: name,
      repeat: repeat,
      effects: frames?.set,
      ok: true,
      msg: "successfully add LED effect",
    });
  }

  @Mutation((returns) => LEDEffectResponse)
  async editLEDEffect(
    @PubSub(Topic.LEDRecord)
    publishLEDRecord: Publisher<LEDPayload>,
    @Arg("input") input: EditLEDInput,
    @Ctx() ctx: TContext
  ) {
    const { id, name, repeat, frames } = input;

    // check overlapped
    const exist = await ctx.prisma.lEDEffect.findFirst({
      where: { id: id },
    });
    if (!exist)
      return Object.assign({
        partName: ",",
        effectName: ",",
        repeat: repeat,
        effects: frames,
        ok: false,
        msg: "effectName do not exist.",
      });
    const effectToEdit = await ctx.prisma.editingLEDEffect.findFirst({
      where: { LEDEffectId: id },
    });
    if (
      effectToEdit &&
      effectToEdit.userId &&
      effectToEdit.userId !== ctx.userId
    ) {
      throw new Error(`The frame is now editing by ${effectToEdit.userId}.`);
    }
    // check if the LED is used in ControlData
    const checkEffectInControl = await ctx.prisma.controlData.findMany({
      where: {
        value: { path: ["src"], equals: exist.name },
      },
    });
    if (checkEffectInControl.length !== 0) {
      throw new Error(`LED is used in ControlData`);
    }
    const target = await ctx.prisma.lEDEffect.update({
      where: {
        id: id,
      },
      data: {
        // add update name
        name: name,
        repeat: repeat,
        frames: frames?.set,
      },
    });

    const recordPayload: LEDPayload = {
      mutation: ledMutation.UPDATED,
      editBy: ctx.userId,
      partName: exist.partName,
      effectName: name,
      data: target,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({
      ok: true,
      msg: "successfully edit LED effect",
      partName: exist.partName,
      effectName: name,
      repeat: target.repeat,
      effects: target.frames,
    });
  }

  @Mutation((returns) => DeleteLEDEffectResponse)
  async deleteLEDEffect(
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
    const effectToDelete = await ctx.prisma.editingLEDEffect.findFirst({
      where: { LEDEffectId: exist.id },
    });
    if (
      effectToDelete &&
      effectToDelete.userId &&
      effectToDelete.userId !== ctx.userId
    ) {
      throw new Error(`The frame is now editing by ${effectToDelete.userId}.`);
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
    return { ok: true, msg: "successfully delete LED effect" };
  }
}
