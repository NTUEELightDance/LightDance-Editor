import {
  Resolver,
  Ctx,
  Query,
  Mutation,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";
import { Prisma } from "@prisma/client";

import { EffectListResponse } from "./response/effectListResponse";
import {
  deleteRedisControl,
  deleteRedisPosition,
  getRedisControl,
  getRedisPosition,
  updateRedisControl,
  updateRedisPosition,
} from "../utility";
import { Topic } from "./subscriptions/topic";
import {
  EffectListPayload,
  EffectListMutation,
} from "./subscriptions/effectlist";
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
  TContext,
  TRedisControl,
  TRedisControls,
  TRedisPosition,
  TRedisPositions,
} from "../types/global";
import {
  ControlFrame,
  PositionFrame,
  EffectListData,
  Dancer,
  Part,
} from "../../prisma/generated/type-graphql";
import { ControlDefault } from "./types/controlType";

@Resolver(() => EffectListData)
export class EffectListResolver {
  @Query(() => [EffectListData])
  async effectList(@Ctx() ctx: TContext) {
    const effectLists: EffectListData[] =
      await ctx.prisma.effectListData.findMany();
    const result = effectLists.map((effectList) => {
      const { id, start, end, description } = effectList;
      let { controlFrames, positionFrames } = effectList;
      if (!controlFrames) controlFrames = [];
      if (!positionFrames) positionFrames = [];
      return {
        id,
        start,
        end,
        description,
        controlFrames: controlFrames,
        positionFrames: positionFrames,
      };
    });
    return result;
  }

  @Mutation(() => EffectListData)
  async addEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Arg("end", { nullable: false }) end: number,
    @Arg("description", { nullable: true }) description: string,
    @Ctx() ctx: TContext
  ) {
    // get controlFrame & positionFrame id
    const controlFrames: ControlFrame[] =
      await ctx.prisma.controlFrame.findMany({
        where: { start: { lte: end, gte: start } },
        orderBy: { start: "asc" },
      });
    if (controlFrames.length === 0) {
      throw new Error("no control frames");
    }
    const controlFrameIDs = controlFrames.map(
      (controlFrame) => controlFrame.id
    );
    const positionFrames: PositionFrame[] =
      await ctx.prisma.positionFrame.findMany({
        where: { start: { lte: end, gte: start } },
        orderBy: { start: "asc" },
      });
    if (positionFrames.length === 0) {
      throw new Error("no position frames");
    }
    const positionFrameIDs = positionFrames.map(
      (positionFrame) => positionFrame.id
    );

    // get controlFrame & positionFrame data from Redis
    const redisControlFrames = await Promise.all(
      controlFrameIDs.map(async (controlFrameID: number) => {
        const id = controlFrameID;
        return await getRedisControl(id);
      })
    );
    const redisPositionFrames = await Promise.all(
      positionFrameIDs.map(async (positionFrameID: number) => {
        const id = positionFrameID;
        return await getRedisPosition(id);
      })
    );

    // get dancers & parts data
    const dancerData = await ctx.prisma.dancer.findMany({
      include: {
        parts: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    // create effectList
    const effectList = await ctx.prisma.effectListData.create({
      data: {
        start: start,
        end: end,
        description: description ? description : null,
        dancerData,
        controlFrames: redisControlFrames,
        positionFrames: redisPositionFrames,
      },
    });
    const result = {
      id: effectList.id,
      start,
      end,
      description,
      controlFrames: redisControlFrames,
      positionFrames: redisPositionFrames,
    };
    const payload: EffectListPayload = {
      mutation: EffectListMutation.CREATED,
      editBy: ctx.userId,
      effectListID: effectList.id,
      effectListData: result,
    };
    await publish(payload);
    return result;
  }

  @Mutation(() => EffectListResponse)
  async deleteEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("id") id: number,
    @Ctx() ctx: TContext
  ) {
    await ctx.prisma.effectListData.deleteMany({
      where: { id: id },
    });
    const payload: EffectListPayload = {
      mutation: EffectListMutation.DELETED,
      editBy: ctx.userId,
      effectListID: id,
    };
    await publish(payload);
    return { ok: true, msg: `Delete effect id: ${id}` };
  }

  @Mutation(() => EffectListResponse)
  async applyEffectList(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
    publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("id") id: number,
    @Arg("start", { nullable: false }) start: number,
    @Ctx() ctx: TContext
  ) {
    const effectList: EffectListData =
      await ctx.prisma.effectListData.findUniqueOrThrow({
        where: { id: id },
      });
    const end = start - effectList.start + effectList.end;

    // check editing in target area
    // control
    const findEditingControlFrame =
      await ctx.prisma.editingControlFrame.findFirst({
        where: { editingFrame: { start: { lte: end, gte: start } } },
      });
    if (findEditingControlFrame) {
      return {
        ok: false,
        msg: `User ${findEditingControlFrame.userId} is editing frame ${findEditingControlFrame.frameId}`,
      };
    }
    // position
    const findEditingPositionFrame =
      await ctx.prisma.editingPositionFrame.findFirst({
        where: { editingFrame: { start: { lte: end, gte: start } } },
      });
    if (findEditingPositionFrame) {
      return {
        ok: false,
        msg: `User ${findEditingPositionFrame.userId} is editing frame ${findEditingPositionFrame.frameId}`,
      };
    }

    // clear original data
    const deleteControlFrame: ControlFrame[] =
      await ctx.prisma.controlFrame.findMany({
        where: { start: { lte: end, gte: start } },
      });
    const deletePositionFrame: PositionFrame[] =
      await ctx.prisma.positionFrame.findMany({
        where: { start: { lte: end, gte: start } },
      });
    await ctx.prisma.controlFrame.deleteMany({
      where: { start: { lte: end, gte: start } },
    });
    await ctx.prisma.positionFrame.deleteMany({
      where: { start: { lte: end, gte: start } },
    });
    await Promise.all(
      deleteControlFrame.map(async (data) => {
        const { id } = data;
        await deleteRedisControl(id);
      })
    );
    await Promise.all(
      deletePositionFrame.map(async (data) => {
        const { id } = data;
        await deleteRedisPosition(id);
      })
    );
    const deleteControlList = deleteControlFrame.map((data) => {
      return data.id;
    });
    const deletePositionList = deletePositionFrame.map((data) => {
      return data.id;
    });

    // TODO: preprocess data
    const oldAllDancer = effectList.dancerData as any[];
    const newAllDancer: Dancer[] = await ctx.prisma.dancer.findMany({
      include: {
        parts: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    // add
    const allPart: Part[] = await ctx.prisma.part.findMany();
    const newControlFrameIDs = await Promise.all(
      Object.values(effectList.controlFrames).map(async (frameObj: any) => {
        if (frameObj !== null) {
          const frameStart = frameObj.start;
          const { fade, status } = frameObj;
          const new_start = frameStart - effectList.start + start;
          const frame: ControlFrame = await ctx.prisma.controlFrame.create({
            data: { start: new_start, fade },
          });

          // create empty Control Data
          await Promise.all(
            allPart.map(async (part) => {
              const { id, type } = part;
              await ctx.prisma.controlData.create({
                data: {
                  partId: id,
                  frameId: frame.id,
                  value: ControlDefault[type],
                },
              });
            })
          );
          // assign value into control Data
          await Promise.all(
            oldAllDancer.map(async (oldDancer, dancerIndex) => {
              const dancerId = oldDancer?.id;

              // check dancer in new dancer
              const dancerIdx = newAllDancer.findIndex(
                (dancer) => dancer.id === dancerId
              );
              if (dancerIdx === -1) return;

              await Promise.all(
                oldDancer.parts?.map(
                  async (oldPart: Part, partIndex: number) => {
                    const partId = oldPart.id;
                    const type = oldPart.type;

                    // check part in new dancer
                    const partIdx = newAllDancer[dancerIdx].parts?.findIndex(
                      (part) => part.id === partId
                    );
                    if (partIdx === -1) return;

                    const value: Prisma.JsonObject = {};
                    value.alpha = Number(status[dancerIndex][partIndex][1]);
                    if (type === "FIBER")
                      value.color = status[dancerIndex][partIndex][0];
                    else value.src = status[dancerIndex][partIndex][0];
                    // const value = status[dancerIdx][partIdx];
                    await ctx.prisma.controlData.update({
                      where: {
                        partId_frameId: {
                          partId: partId,
                          frameId: frame.id,
                        },
                      },
                      data: {
                        value,
                      },
                    });
                  }
                )
              );
            })
          );
          return frame.id;
        }
        return -1;
      })
    );
    const allDancer: Dancer[] = await ctx.prisma.dancer.findMany({
      include: {
        parts: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
    const newPositionFrameIDs = await Promise.all(
      Object.values(effectList.positionFrames).map(async (frameObj: any) => {
        if (frameObj !== null) {
          const frameStart = frameObj.start;
          const { pos } = frameObj;
          const new_start = frameStart - effectList.start + start;
          const frame: PositionFrame = await ctx.prisma.positionFrame.create({
            data: { start: new_start },
          });

          // create empty Position Data
          await Promise.all(
            allDancer.map(async (dancer) => {
              const { id } = dancer;
              await ctx.prisma.positionData.create({
                data: {
                  dancerId: id,
                  frameId: frame.id,
                  x: 0.0,
                  y: 0.0,
                  z: 0.0,
                },
              });
            })
          );
          // assign value into position Data
          await Promise.all(
            oldAllDancer.map(async (oldDancer, dancerIndex) => {
              const dancerId = oldDancer?.id;

              // check dancer in new dancer
              const dancerIdx = newAllDancer.findIndex(
                (dancer) => dancer.id === dancerId
              );
              if (dancerIdx === -1) return;

              const value = pos[dancerIndex];
              await ctx.prisma.positionData.update({
                where: {
                  dancerId_frameId: {
                    dancerId: dancerId,
                    frameId: frame.id,
                  },
                },
                data: {
                  x: value[0],
                  y: value[1],
                  z: value[2],
                },
              });
            })
          );
          return frame.id;
        }
        return -1;
      })
    );

    // update redis
    await Promise.all(
      newControlFrameIDs.map(async (id) => {
        await updateRedisControl(id);
      })
    );
    await Promise.all(
      newPositionFrameIDs.map(async (id) => {
        await updateRedisPosition(id);
      })
    );

    // subscription control
    const controlMapPayload: ControlMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: newControlFrameIDs,
        deleteList: deleteControlList,
        updateList: [],
      },
    };
    await publishControlMap(controlMapPayload);

    let newControlFrames = await ctx.prisma.controlFrame.findMany();
    newControlFrames = newControlFrames.sort();
    let allControlFrames = await ctx.prisma.controlFrame.findMany();
    allControlFrames = allControlFrames.sort();
    let index = -1;
    if (newControlFrames[0]) {
      allControlFrames.map((frame, idx: number) => {
        if (frame.id === newControlFrames[0].id) {
          index = idx;
        }
      });
    }
    const controlRecordIDs = newControlFrames.map((frame) => {
      return frame.id;
    });
    const controlRecordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.CREATED_DELETED,
      editBy: ctx.userId,
      addID: controlRecordIDs,
      deleteID: deleteControlList,
      updateID: [],
      index,
    };
    await publishControlRecord(controlRecordPayload);

    // subscription position
    const positionMapPayload: PositionMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: newPositionFrameIDs,
        deleteList: deletePositionList,
        updateList: [],
      },
    };
    await publishPositionMap(positionMapPayload);

    let newPositionFrames = await ctx.prisma.positionFrame.findMany();
    newPositionFrames = newPositionFrames.sort();
    let allPositionFrames = await ctx.prisma.positionFrame.findMany();
    allPositionFrames = allPositionFrames.sort();
    index = -1;
    if (newPositionFrames[0]) {
      allPositionFrames.map((frame, idx: number) => {
        if (frame.id === newPositionFrames[0].id) {
          index = idx;
        }
      });
    }
    const positionRecordIDs = newPositionFrames.map((frame) => {
      return frame.id;
    });
    const positionRecordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.CREATED_DELETED,
      editBy: ctx.userId,
      addID: positionRecordIDs,
      deleteID: deletePositionList,
      updateID: [],
      index,
    };
    await publishPositionRecord(positionRecordPayload);

    return { ok: true, msg: `Apply effect id: ${id}` };
  }
}
