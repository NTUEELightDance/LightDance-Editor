import {
  Resolver,
  Ctx,
  Mutation,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";

import redis from "../redis";
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
import { updateRedisControl, updateRedisPosition } from "../utility";
import { Topic } from "./subscriptions/topic";
import { ShiftResponse } from "./response/shiftResponse";
import { IControl, IControlFrame, IDancer, IPart, IPosition, IPositionFrame, TContext } from "../types/global";

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
    @Arg("start", { nullable: false }) start: number,
    @Arg("end", { nullable: false }) end: number,
    @Arg("move", { nullable: false }) move: number,
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

    // check editing of control
    if (shiftControl) {
      // check target area
      const findControlFrame = await ctx.prisma.controlFrame.findFirst({where: {start: {lte: end+move, gte: start+move}}});
      if(findControlFrame === null){
        throw new Error("control frame doesn't exist");
      }
      else{
        const findControlFrameID = findControlFrame.id;
        const checkControlEditing = await ctx.prisma.editingControlFrame.findFirst({where: {frameId: findControlFrameID}});
        if (checkControlEditing !== null)
          return {
            ok: false,
            msg: `User ${checkControlEditing.userId} is editing frame ${checkControlEditing.frameId}`,
          };
      }

      // check source area
      const findOldControlFrame = await ctx.prisma.controlFrame.findFirst({where: {start: {lte: end, gte: start}}});
      if(findOldControlFrame === null){
        throw new Error("old control frame doesn't exist");
      }
      else{
        const findOldControlFrameID = findOldControlFrame.id;
        const checkOldControlEditing = await ctx.prisma.editingControlFrame.findFirst({where: {frameId: findOldControlFrameID}});
        if (checkOldControlEditing !== null)
          return {
            ok: false,
            msg: `User ${checkOldControlEditing.userId} is editing frame ${checkOldControlEditing.frameId}`,
          };
      }
    }

    // check editing of position
    if (shiftPosition) {
      // check target area
      const findPositionFrame = await ctx.prisma.positionFrame.findFirst({where: {start: {lte: end+move, gte: start+move}}});
      if(findPositionFrame === null){
        throw new Error("position frame doesn't exist");
      }
      else{
        const findPositionFrameID = findPositionFrame.id;
        const checkPositionEditing = await ctx.prisma.editingPositionFrame.findFirst({where: {frameId: findPositionFrameID}});
        if (checkPositionEditing !== null)
          return {
            ok: false,
            msg: `User ${checkPositionEditing.userId} is editing frame ${checkPositionEditing.frameId}`,
          };
      }

      // check source area
      const findOldPositionFrame = await ctx.prisma.positionFrame.findFirst({where: {start: {lte: end, gte: start}}});
      if(findOldPositionFrame === null){
        throw new Error("old position frame doesn't exist");
      }
      else{
        const findOldPositionFrameID = findOldPositionFrame.id;
        const checkOldPositionEditing = await ctx.prisma.editingPositionFrame.findFirst({where: {frameId: findOldPositionFrameID}});
        if (checkOldPositionEditing !== null)
          return {
            ok: false,
            msg: `User ${checkOldPositionEditing.userId} is editing frame ${checkOldPositionEditing.frameId}`,
          };
      }
    }

    // clear
    let deleteControlFrame;
    let deletePositionFrame;
    if (move > 0) {
      if (start + move > end) {
        // clear region: [ start + move, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end+move, gte: start+move}}});
          await ctx.prisma.controlFrame.deleteMany({where: {start: {lte: end+move, gte: start+move}}});
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end+move, gte: start+move}}});
          await ctx.prisma.positionFrame.deleteMany({where: {start: {lte: end+move, gte: start+move}}});
        }
      } else {
        // clear region: ( end, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end+move, gt: end}}});
          await ctx.prisma.controlFrame.deleteMany({where: {start: {lte: end+move, gt: end}}});
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end+move, gt: end}}});
          await ctx.prisma.positionFrame.deleteMany({where: {start: {lte: end+move, gt: end}}});
        }
      }
    } else {
      if (end + move >= start) {
        // clear region: [ start + move, start)
        if (shiftControl) {
          deleteControlFrame = await ctx.prisma.controlFrame.findMany({where: {start: {lt: start, gte: start+move}}});
          await ctx.prisma.controlFrame.deleteMany({where: {start: {lt: start, gt: start+move}}});
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.prisma.positionFrame.findMany({where: {start: {lt: start, gte: start+move}}});
          await ctx.prisma.positionFrame.deleteMany({where: {start: {lt: start, gte: start+move}}});
        }
      } else {
        // clear region: [ start + move, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end+move, gte: start+move}}});
          await ctx.prisma.controlFrame.deleteMany({where: {start: {lte: end+move, gte: start+move}}});
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end+move, gte: start+move}}});
          await ctx.prisma.positionFrame.deleteMany({where: {start: {lte: end+move, gte: start+move}}});
        }
      }
    }

    // updating part's controlData
    const parts = await ctx.prisma.part.findMany();
    if(deleteControlFrame !== undefined){
      await Promise.all(
        deleteControlFrame.map(async (data) => {
          const { id } = data;
          const deleteControlData = await ctx.prisma.controlData.findMany({where: {frameId: id}});
          await Promise.all(
            parts.map(async (part) => {
              const controlToDelete = deleteControlData.find(
                (control) => control.partId === part.id
              );
              if(controlToDelete !== undefined){
                await ctx.prisma.controlData.deleteMany({where: {partId: controlToDelete.partId, frameId: controlToDelete.frameId}});
              }
            })
          );
          await redis.del(`CTRLFRAME_${id}`);
        })
      );
    }

    // updating dancer's positionData
    if(deletePositionFrame !== undefined){
      await Promise.all(
        deletePositionFrame.map(async (data) => {
          const { id } = data;
          const dancers = await ctx.prisma.dancer.findMany();
          const deletePositionData = await ctx.prisma.positionData.findMany({where: {frameId: id}});
          Promise.all(
            dancers.map(async (dancer) => {
              const positionToDelete = deletePositionData.find(
                (position) => position.dancerId === dancer.id
              );
              if(positionToDelete !== undefined){
                await ctx.prisma.positionData.deleteMany({where: {dancerId: positionToDelete.dancerId, frameId: positionToDelete.frameId}});
              }
            })
          );
          redis.del(`POSFRAME_${id}`);
        })
      );
    }

    // shift
    // control
    if (shiftControl) {
      // find source data
      let updateControlFrames = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end, gte: start}}});
      updateControlFrames = updateControlFrames.sort();
      // update redis
      const updateControlIDs: number[] = await Promise.all(
        updateControlFrames.map(async (obj) => {
          const { id } = obj;
          const findControlFrame = await ctx.prisma.controlFrame.findFirst({where: {id: id}});
          if(findControlFrame !== null){
            await ctx.prisma.controlFrame.update({where: {id: id}, data: {start: findControlFrame.start+move}});
          }
          await updateRedisControl(`CTRLFRAME_${id}`);
          return id;
        })
      );

      // get id list of deleteControl
      if(deleteControlFrame !== undefined){
        const deleteControlList = deleteControlFrame.map((data) => {
          return data.id;
        });

        // subscription
        const controlMapPayload: ControlMapPayload = {
          editBy: ctx.userID,
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
          editBy: ctx.userID,
          addID: [],
          updateID: updateControlIDs,
          deleteID: deleteControlList,
          index,
        };
        await publishControlRecord(controlRecordPayload);
      }
    }

    // position
    if (shiftPosition) {
      // find source data
      let updatePositionFrames = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end, gte: start}}});
      updatePositionFrames = updatePositionFrames.sort();
      // update redis
      const updatePositionIDs: number[] = await Promise.all(
        updatePositionFrames.map(async (obj) => {
          const { id } = obj;
          const findPositionFrame = await ctx.prisma.positionFrame.findFirst({where: {id: id}});
          if(findPositionFrame !== null){
            await ctx.prisma.positionFrame.update({where: {id: id}, data: {start: findPositionFrame.start+move}});
          }
          await updateRedisPosition(`POSFRAME_${id}`);
          return id;
        })
      );

      // get id list of deletePosition
      if(deletePositionFrame !== undefined){
        const deletePositionList = deletePositionFrame.map((data) => {
          return data.id;
        });

        // subscription
        const positionMapPayload: PositionMapPayload = {
          editBy: ctx.userID,
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
          editBy: ctx.userID,
          addID: [],
          updateID: updatePositionIDs,
          deleteID: deletePositionList,
          index,
        };
        await publishPositionRecord(positionRecordPayload);
      }
    }

    return { ok: true, msg: "Done" };
  }
}

