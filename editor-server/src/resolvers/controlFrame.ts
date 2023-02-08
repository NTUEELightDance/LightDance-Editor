import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  PubSub,
  Publisher,
  ID,
} from "type-graphql";

import {
  EditControlFrameInput,
  DeleteControlFrameInput,
} from "./inputs/controlFrame";
import { ControlFrame, Part } from "../../prisma/generated/type-graphql";
import { deleteRedisControl, updateRedisControl } from "../utility";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import {
  ControlRecordMutation,
  ControlRecordPayload,
} from "./subscriptions/controlRecord";
import { TContext } from "../types/global";
@Resolver((of) => ControlFrame)
export class ControlFrameResolver {
  @Query((returns) => ControlFrame)
  async controlFrame(@Arg("frameID") frameID: number, @Ctx() ctx: TContext) {
    const frame = await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
    });
    if (!frame) throw new Error(`frame id ${frameID} not found`);
    return frame;
  }

  @Query((returns) => [ID])
  async controlFrameIDs(@Ctx() ctx: TContext) {
    const frames = await ctx.prisma.controlFrame.findMany({
      orderBy: { start: "asc" },
    });
    const id = frames.map((frame: ControlFrame) => frame.id);
    return id;
  }

  @Mutation((returns) => ControlFrame)
  async addControlFrame(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Arg("fade", { nullable: true, defaultValue: false }) fade: boolean,
    @Ctx() ctx: TContext
  ) {
    const check = await ctx.prisma.controlFrame.findFirst({
      where: { start },
    });
    if (check) {
      throw new Error(
        `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
      );
    }
    const newControlFrame = await ctx.prisma.controlFrame.create({
      data: {
        start,
        fade,
      },
    });
    const allParts = await ctx.prisma.part.findMany();
    await Promise.all(
      allParts.map(async (part: Part) => {
        await ctx.prisma.controlData.create({
          data: {
            frameId: newControlFrame.id,
            partId: part.id,
            value: ControlDefault[part.type],
          },
        });
      })
    );
    await updateRedisControl(newControlFrame.id);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: [newControlFrame.id],
        deleteList: [],
        updateList: [],
      },
    };
    await publishControlMap(mapPayload);
    const allControlFrames: ControlFrame[] =
      await ctx.prisma.controlFrame.findMany({
        orderBy: { start: "asc" },
      });
    let index = -1;
    allControlFrames.map((frame, idx: number) => {
      if (frame.id === newControlFrame.id) {
        index = idx;
        return;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.CREATED,
      editBy: ctx.userId,
      addID: [newControlFrame.id],
      updateID: [],
      deleteID: [],
      index,
    };
    await publishControlRecord(recordPayload);
    return newControlFrame;
  }

  // mainly for adjust frame time
  @Mutation((returns) => ControlFrame)
  async editControlFrame(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @Arg("input") input: EditControlFrameInput,
    @Ctx() ctx: TContext
  ) {
    const { start } = input;
    if (start) {
      const check = await ctx.prisma.controlFrame.findFirst({
        where: { start: input.start },
      });
      if (check && check.id !== input.frameID) {
        throw new Error(
          `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
        );
      }
    }
    const frameToEdit = await ctx.prisma.editingControlFrame.findFirst({
      where: { frameId: input.frameID },
    });
    if (
      frameToEdit &&
      frameToEdit.userId &&
      frameToEdit.userId !== ctx.userId
    ) {
      throw new Error(`The frame is now editing by ${frameToEdit.userId}.`);
    }
    const controlFrame = await ctx.prisma.controlFrame.findFirst({
      where: { id: input.frameID },
      include: {
        controlDatas: {
          include: { part: true, frame: true },
        },
      },
    });
    if (!controlFrame) throw new Error("Control Frame not found");

    const updateControlFrame = await ctx.prisma.controlFrame.update({
      where: { id: input.frameID },
      data: {
        start: input.start === undefined ? controlFrame.start : input.start,
        fade: input.fade === undefined ? controlFrame.fade : input.fade,
      },
    });

    await updateRedisControl(controlFrame.id);

    const payload: ControlMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [controlFrame.id],
      },
    };
    await publishControlMap(payload);
    const allControlFrames: ControlFrame[] =
      await ctx.prisma.controlFrame.findMany({
        orderBy: { start: "asc" },
      });
    let index = -1;
    allControlFrames.map((frame, idx: number) => {
      if (frame.id === controlFrame.id) {
        index = idx;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.UPDATED,
      editBy: ctx.userId,
      addID: [],
      updateID: [controlFrame.id],
      deleteID: [],
      index,
    };
    await publishControlRecord(recordPayload);
    return updateControlFrame;
  }

  @Mutation((returns) => ControlFrame)
  async deleteControlFrame(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @Arg("input") input: DeleteControlFrameInput,
    @Ctx() ctx: TContext
  ) {
    const { frameID } = input;
    if (!frameID) throw new Error("Please give frame id");
    const frameToDelete = await ctx.prisma.editingControlFrame.findFirst({
      where: { frameId: frameID },
    });
    if (
      frameToDelete &&
      frameToDelete.userId &&
      frameToDelete.userId !== ctx.userId
    ) {
      throw new Error(`The frame is now editing by ${frameToDelete.userId}.`);
    }
    const deletedFrame = await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
      include: {
        controlDatas: {
          include: { part: true, frame: true },
        },
      },
    });
    if (!deletedFrame) throw new Error("frame id not found");
    await ctx.prisma.controlFrame.delete({ where: { id: frameID } });
    await deleteRedisControl(frameID);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: [],
        deleteList: [frameID],
        updateList: [],
      },
    };
    await publishControlMap(mapPayload);
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.DELETED,
      addID: [],
      updateID: [],
      deleteID: [frameID],
      editBy: ctx.userId,
      index: -1,
    };
    await publishControlRecord(recordPayload);
    return deletedFrame;
  }
}
