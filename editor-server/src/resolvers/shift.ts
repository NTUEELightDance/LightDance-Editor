import {
  Resolver,
  Ctx,
  Mutation,
  PubSub,
  Publisher,
  Arg,
  Int,
} from "type-graphql";
import { PromisePool } from "@supercharge/promise-pool";

import {
  ControlRecordPayload,
  ControlRecordMutation,
} from "./subscriptions/controlRecord";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { PositionMapPayload } from "./subscriptions/positionMap";
import {
  PositionRecordPayload,
  PositionRecordMutation,
} from "./subscriptions/positionRecord";
import {
  deleteRedisControl,
  deleteRedisPosition,
  updateRedisControl,
  updateRedisPosition,
} from "../utility";
import { Topic } from "./subscriptions/topic";
import { ShiftResponse } from "./response/shiftResponse";
import { TContext } from "../types/global";

@Resolver()
export class ShiftResolver {
  @Mutation((returns) => ShiftResponse)
  async shift(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
    publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("start", (type) => Int, { nullable: false }) start: number,
    @Arg("end", (type) => Int, { nullable: false }) end: number,
    @Arg("move", (type) => Int, { nullable: false }) move: number,
    @Arg("shiftControl", { nullable: false }) shiftControl: boolean,
    @Arg("shiftPosition", { nullable: false }) shiftPosition: boolean,
    @Ctx() ctx: TContext
  ) {
    // check negetive
    if (start + move < 0) {
      return {
        ok: false,
        msg: "Negative start is not legal",
      };
    }

    // check start after end
    if (start >= end) {
      return {
        ok: false,
        msg: "start must smaller than end",
      };
    }

    // overlap interval
    const overlap_start =
      move >= 0 ? (start + move > end ? start + move : end + 1) : start + move;
    const overlap_end =
      move >= 0 ? end + move : end + move < start ? end + move : start - 1;
    const check_start = move >= 0 ? start : start + move;
    const check_end = move >= 0 ? end + move : end;

    // check editing of control
    if (shiftControl) {
      // check editing
      const editingControlFrame =
        await ctx.prisma.editingControlFrame.findFirst({
          where: {
            editingFrame: { start: { lte: check_end, gte: check_start } },
          },
        });
      if (editingControlFrame !== null) {
        return {
          ok: false,
          msg: `User ${editingControlFrame.userId} is editing frame ${editingControlFrame.frameId}`,
        };
      }
    }

    // check editing of position
    if (shiftPosition) {
      // check target area
      const editingPositionFrame =
        await ctx.prisma.editingPositionFrame.findFirst({
          where: {
            editingFrame: { start: { lte: check_end, gte: check_start } },
          },
        });
      if (editingPositionFrame !== null) {
        return {
          ok: false,
          msg: `User ${editingPositionFrame.userId} is editing frame ${editingPositionFrame.frameId}`,
        };
      }
    }

    if (shiftControl) {
      // clear
      const deleteControlFrame = await ctx.prisma.controlFrame.findMany({
        where: { start: { lte: overlap_end, gte: overlap_start } },
      });
      await ctx.prisma.controlFrame.deleteMany({
        where: { start: { lte: overlap_end, gte: overlap_start } },
      });

      // shift
      // find source data
      const updateControlFrames = await ctx.prisma.controlFrame.findMany({
        where: { start: { lte: end, gte: start } },
        orderBy: { start: move >= 0 ? "asc" : "desc" },
      });

      // update redis
      const updateControlIDs = await PromisePool.withConcurrency(50)
        .for(updateControlFrames)
        .process(async ({ id }) => {
          await ctx.prisma.controlFrame.update({
            where: { id },
            data: { start: { increment: move } },
          });
          await updateRedisControl(id);
          return id;
        })
        .then((result) =>
          move < 0 ? result.results.reverse() : result.results
        );

      // get id list of deleteControl
      const deleteControlList = await PromisePool.withConcurrency(50)
        .for(deleteControlFrame)
        .process(async (data) => {
          await deleteRedisControl(data.id);
          return data.id;
        })
        .then((result) => result.results);

      // subscription
      const controlMapPayload: ControlMapPayload = {
        editBy: ctx.userId,
        frame: {
          createList: [],
          deleteList: deleteControlList,
          updateList: updateControlIDs,
        },
      };
      await publishControlMap(controlMapPayload);

      let allControlFrames = await ctx.prisma.controlFrame.findMany();
      allControlFrames = allControlFrames.sort();
      let index = -1;
      await allControlFrames.map((frame, idx: number) => {
        if (frame.id === updateControlIDs[0]) {
          index = idx;
        }
      });
      const controlRecordPayload: ControlRecordPayload = {
        mutation: ControlRecordMutation.UPDATED_DELETED,
        editBy: ctx.userId,
        addID: [],
        updateID: updateControlIDs,
        deleteID: deleteControlList,
        index,
      };
      await publishControlRecord(controlRecordPayload);
    }

    if (shiftPosition) {
      // clear
      const deletePositionFrame = await ctx.prisma.positionFrame.findMany({
        where: { start: { lte: overlap_end, gte: overlap_start } },
      });
      await ctx.prisma.positionFrame.deleteMany({
        where: { start: { lte: overlap_end, gte: overlap_start } },
      });

      // shift
      // find source data
      const updatePositionFrames = await ctx.prisma.positionFrame.findMany({
        where: { start: { lte: end, gte: start } },
        orderBy: { start: move >= 0 ? "asc" : "desc" },
      });

      // update redis
      const updatePositionIDs: number[] = await PromisePool.withConcurrency(50)
        .for(updatePositionFrames)
        .process(async ({ id }) => {
          await ctx.prisma.positionFrame.update({
            where: { id },
            data: { start: { increment: move } },
          });
          await updateRedisPosition(id);
          return id;
        })
        .then((result) =>
          move < 0 ? result.results.reverse() : result.results
        );

      // get id list of deletePosition
      const deletePositionList = await PromisePool.withConcurrency(50)
        .for(deletePositionFrame)
        .process(async (data) => {
          await deleteRedisPosition(data.id);
          return data.id;
        })
        .then((result) => result.results);

      // subscription
      const positionMapPayload: PositionMapPayload = {
        editBy: ctx.userId,
        frame: {
          createList: [],
          deleteList: deletePositionList,
          updateList: updatePositionIDs,
        },
      };
      await publishPositionMap(positionMapPayload);

      let allPositionFrames = await ctx.prisma.positionFrame.findMany();
      allPositionFrames = allPositionFrames.sort();
      let index = -1;
      await allPositionFrames.map((frame, idx: number) => {
        if (frame.id === updatePositionIDs[0]) {
          index = idx;
        }
      });
      const positionRecordPayload: PositionRecordPayload = {
        mutation: PositionRecordMutation.UPDATED_DELETED,
        editBy: ctx.userId,
        addID: [],
        updateID: updatePositionIDs,
        deleteID: deletePositionList,
        index,
      };
      await publishPositionRecord(positionRecordPayload);
    }

    return { ok: true, msg: "Done" };
  }
}
