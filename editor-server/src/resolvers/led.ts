import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  PubSub,
  Publisher,
  Int,
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
        id: -1,
        partName: partName,
        effectName: name,
        repeat: repeat,
        effects: [],
        ok: false,
        msg: "no corresponding part.",
      });
    }

    // check if the color in LED is valid
    const error: string[] = [];
    const colors = await ctx.prisma.color.findMany({ select: { id: true } });
    const colorIds = colors.map((color) => color.id);
    if (frames) {
      frames.set.map((frame: any) => {
        frame.LEDs.map((LED: number[]) => {
          if (LED.length !== 2) {
            error.push(`LEDs shape invalid.`);
            return;
          }
          if (!colorIds.includes(LED[0])) {
            error.push(`Color Id ${LED[0]} not found.`);
          }
        });
      });
      if (error.length !== 0) {
        return Object.assign({
          id: -1,
          partName: ",",
          effectName: ",",
          repeat: 0,
          effects: [],
          ok: false,
          msg: error.join(" | "),
        });
      }
    }

    // check overlapped
    const exist = await ctx.prisma.lEDEffect.findMany({
      where: { name: name, partName: partName },
    });
    if (exist.length !== 0)
      return Object.assign({
        id: -1,
        partName: partName,
        effectName: name,
        effects: [],
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
      id: newLED.id,
      partName,
      effectName: name,
      data: newLED,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({
      id: newLED.id,
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
        id: -1,
        partName: ",",
        effectName: ",",
        repeat: 0,
        effects: [],
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

    // check if the color in LED is valid
    const error: string[] = [];
    const colors = await ctx.prisma.color.findMany({ select: { id: true } });
    const colorIds = colors.map((color) => color.id);
    if (frames) {
      frames.set.map((frame: any) => {
        frame.LEDs.map((LED: number[]) => {
          if (LED.length !== 2) {
            error.push(`LEDs shape invalid.`);
            return;
          }
          if (!colorIds.includes(LED[0])) {
            error.push(`Color Id ${LED[0]} not found.`);
          }
        });
      });
      if (error.length !== 0) {
        return Object.assign({
          id: -1,
          partName: ",",
          effectName: ",",
          repeat: 0,
          effects: [],
          ok: false,
          msg: error.join(" | "),
        });
      }
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
      id: target.id,
      editBy: ctx.userId,
      partName: exist.partName,
      effectName: name,
      data: target,
    };
    await publishLEDRecord(recordPayload);

    return Object.assign({
      id: id,
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
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: TContext
  ) {
    // check exist
    const exist = await ctx.prisma.lEDEffect.findUnique({
      where: { id },
    });
    if (!exist)
      return {
        ok: false,
        msg: `LEDEffect Id ${id} not found`,
      };

    const checkControl = await ctx.prisma.controlData.findMany({
      where: { value: { path: ["src"], equals: id } },
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
        msg: `LEDeffect Id ${id} is used in frame Ids ${ids}`,
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
      return {
        ok: false,
        msg: `The frame is now editing by ${effectToDelete.userId}.`,
      };
    }
    await ctx.prisma.lEDEffect.delete({
      where: { id },
    });
    const recordPayload: LEDPayload = {
      mutation: ledMutation.DELETED,
      editBy: ctx.userId,
      id: exist.id,
    };
    await publishLEDRecord(recordPayload);
    return { ok: true, msg: "successfully delete LED effect" };
  }
}
