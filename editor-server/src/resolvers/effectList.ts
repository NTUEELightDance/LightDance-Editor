import {
  Resolver,
  Ctx,
  Query,
  Mutation,
  PubSub,
  Publisher,
  Arg,
  ID,
} from "type-graphql";

// import { EffectList } from "./types/effectList";
import redis from "../redis";
import { EffectListResponse } from "./response/effectListResponse";
import {
  generateID,
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
import { IControl, IControlFrame, IDancer, IEffectList, IPart, IPosition, IPositionFrame, TContext, TRedisControl, TRedisControls, TRedisPosition, TRedisPositions } from "../types/global";
import { EffectListData, EffectListDataCreateInput } from "../../prisma/generated/type-graphql";
import { JSONObject } from "graphql-scalars/typings/mocks";
import { ControlData } from "./types/controlData";

type AllDancer = {
  [key: string]: {
    part: AllPart;
    positionData: any[];
  }
}
type AllPart = {
  [key: string]: {
    type: string;
    id: string;
  }
}
type PartUpdate = {
  [key: string]: any[];
}

@Resolver((of) => EffectListData)
export class EffectListResolver {
  @Query((returns) => [EffectListData])
  async effectList(@Ctx() ctx: TContext) {
    const effectLists = await ctx.prisma.effectListData.findMany();
    const result = effectLists.map((effectList) => {
      let { id, start, end, description, controlFrames, positionFrames } =
        effectList;
      if (!controlFrames) controlFrames = [];
      if (!positionFrames) positionFrames = [];
      return {
        id,
        start,
        end,
        description,
        data: { control: controlFrames, position: positionFrames },
      };
    });
    return result;
  }

  @Mutation((returns) => EffectListData)
  async addEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Arg("end", { nullable: false }) end: number,
    @Arg("description", { nullable: true }) description: string,
    @Ctx() ctx: TContext
  ) {
    const controlFrames = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end, gte: start}}});
    if(controlFrames.length === 0){
      throw new Error("no control frames");
    }
    const controlFrameIDs = controlFrames.map((controlFrame) => 
      String(controlFrame.id)
    )
    const positionFrames = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end, gte: start}}});
    if(positionFrames.length === 0){
      throw new Error("no position frames");
    }
    const positionFrameIDs = positionFrames.map((positionFrame) => 
      String(positionFrame.id)
    )
    /*
    const redisControlFrames: TRedisControls = {};
    await Promise.all(
      controlFrameIDs.map(async (controlFrameID: string) => {
        const id = controlFrameID;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisControl = JSON.parse(cache);
          delete cacheObj.editing;
          redisControlFrames[id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    const redisPositionFrames: TRedisPositions = {};
    await Promise.all(
      positionFrameIDs.map(async (positionFrameID: string) => {
        const id = positionFrameID;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisPosition = JSON.parse(cache);
          delete cacheObj.editing;
          redisPositionFrames[id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    */
    const effectList = await ctx.prisma
    .effectListData.create({data: {start: start, end: end, description: description, controlFrames: controlFrames, positionFrames: positionFrames}});
    const result = {
      id: String(effectList.id),
      start,
      end,
      description,
      controlFrames: controlFrames,
      positionFrames: positionFrames
    };
    const payload: EffectListPayload = {
      mutation: EffectListMutation.CREATED,
      editBy: ctx.userID,
      effectListID: String(effectList.id),
      effectListData: result,
    };
    await publish(payload);
    return result;
  }

  @Mutation((returns) => EffectListResponse)
  async deleteEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("id", (type) => ID, { nullable: false }) id: string,
    @Ctx() ctx: TContext
  ) {
    const deleteEffectList = await ctx.prisma.effectListData.deleteMany({where: {id: Number(id)}});
    const payload: EffectListPayload = {
      mutation: EffectListMutation.DELETED,
      editBy: ctx.userID,
      effectListID: id,
    };
    await publish(payload);
    return { ok: true, msg: `Delete effect id: ${id}` };
  }

  @Mutation((returns) => EffectListResponse)
  async applyEffectList(
    @PubSub(Topic.ControlRecord)
      publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @PubSub(Topic.PositionRecord)
      publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
      publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("id", (type) => ID, { nullable: false }) id: string,
    @Arg("start", { nullable: false }) start: number,
    @Arg("clear", { nullable: false }) clear: boolean,
    @Ctx() ctx: TContext
  ) {
    const effectList = await ctx.prisma.effectListData.findFirst({where: {id: Number(id)}});
    if(effectList === null){
      throw new Error("no effect list");
    }
    else{
      const end = start - effectList.start + effectList.end;

      // check editing in target area
      if (clear) {
        const findControlFrame = await ctx.prisma.controlFrame.findFirst({where: {start: {lte: end, gte: start}}});
        if(findControlFrame === null){
          throw new Error("control frame doesn't exist");
        }
        else{
          const findControlFrameID = findControlFrame.id;
          const checkControlEditing = await ctx.prisma.editingControlFrame.findFirst({where: {frameId: findControlFrameID}});
          if (checkControlEditing)
            return {
              ok: false,
              msg: `User ${checkControlEditing.userId} is editing frame ${checkControlEditing.frameId}`,
            };
        }
        
        const findPositionFrame = await ctx.prisma.positionFrame.findFirst({where: {start: {lte: end, gte: start}}});
        if(findPositionFrame === null){
          throw new Error("position frame doesn't exist");
        }
        else{
          const findPositionFrameID = findPositionFrame.id;
          const checkPositionEditing = await ctx.prisma.editingPositionFrame.findFirst({where: {frameId: findPositionFrameID}});
          if (checkPositionEditing)
            return {
              ok: false,
              msg: `User ${checkPositionEditing.userId} is editing frame ${checkPositionEditing.frameId}`,
            };
        }
      }

      // check overlapping
      let checkOverLap = false;
      if (!clear) {
        await Promise.all(
          Object.values(effectList.controlFrames).map(
            async (controlObject) => {
              if(controlObject !== null){
                const data = Object.values(controlObject);
                const new_start = data[2] - effectList.start + start;
                const checkControlOverlap = await ctx.prisma.controlFrame.findFirst({where: {start: new_start}});
                if (checkControlOverlap) checkOverLap = true;
              }
            }
          )
        );
        await Promise.all(
          Object.values(effectList.positionFrames).map(
            async (positionObject) => {
              if(positionObject !== null){ 
                const data = Object.values(positionObject);
                const new_start = data[1] - effectList.start + start;
                const checkPositionOverlap = await ctx.prisma.positionFrame.findFirst({where: {start: new_start}});
                if (checkPositionOverlap) checkOverLap = true;
              }
            }
          )
        );
      }
      if (checkOverLap) return { ok: false, msg: "Some frame is overlap" };

      // clear
      const deleteControlFrame = await ctx.prisma.controlFrame.findMany({where: {start: {lte: end, gte: start}}});
      const deletePositionFrame = await ctx.prisma.positionFrame.findMany({where: {start: {lte: end, gte: start}}});
      if (clear) {
        const parts = await ctx.prisma.part.findMany();
        await ctx.prisma.controlFrame.deleteMany({where: {start: {lte: end, gte: start}}})
        await ctx.prisma.positionFrame.deleteMany({where: {start: {lte: end, gte: start}}});
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
                await redis.del(String(id));
              })
          );
        }
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
              redis.del(String(id));
            })
          );
        }
      }

      const dancer = await ctx.prisma.dancer.findMany();
      const allDancer: AllDancer = {};
      const partUpdate: PartUpdate = {};
      dancer.map(async (dancerObj) => {
        const { id, name } = dancerObj;
        const parts = await ctx.prisma.part.findMany({where: {dancerId: id}});
        const positionData = await ctx.prisma.positionData.findMany({where: {dancerId: id}});
        const allPart: AllPart = {};
        parts.map(async(partObj) => {
          const { id, name, type } = partObj;
          const controlData = await ctx.prisma.controlData.findMany({where: {partId: id}});
          allPart[name] = { type, id: String(id) };
          partUpdate[String(id)] = controlData;
        });
        allDancer[name] = { part: allPart, positionData };
      });

      // add
      const newControlFrameIDs: string[] = [];
      const newPositionFrameIDs: string[] = [];
      await Promise.all(
        Object.values(effectList.controlFrames).map(async (frameObj) => {
          if(frameObj !== null){
            const data = Object.values(frameObj);
            const new_start = data[2] - effectList.start + start;
            const frame = await ctx.prisma.controlFrame.create({data: {start: new_start, fade: data[1]}});

            newControlFrameIDs.push(String(frame.id));

            const allControlData = await ctx.prisma.controlData.findMany({where: {frameId: data[0]}});            
            await Promise.all(
              allControlData.map(async(ControlData) => {
                if(ControlData.value !== null){
                  await ctx.prisma.controlData.create({data: {partId: ControlData.partId, frameId: frame.id, value: ControlData.value}})
                }
              })
            )
          }
        })
      );
      
      /*
      await Promise.all(
        Object.keys(partUpdate).map(async (partID) => {
          await ctx.prisma.controlData.updateMany({where: {partId: Number(partID)}, data: {value: partUpdate[partID]}});
        })
      );
      */

      await Promise.all(
        Object.values(effectList.positionFrames).map(async (frameObj) => {
          if(frameObj !== null){
            const data = Object.values(frameObj);
            const new_start = data[1] - effectList.start + start;
            const frame = await ctx.prisma.positionFrame.create({data: {start: new_start}});

            newPositionFrameIDs.push(String(frame.id));

            const allPositionData = await ctx.prisma.positionData.findMany({where: {frameId: data[0]}});
            await Promise.all(
              allPositionData.map(async(PositionData) => {
                await ctx.prisma.positionData.create({data: {dancerId: PositionData.dancerId, frameId: frame.id, x: PositionData.x, y: PositionData.y, z: PositionData.z}});
              })
            )
          }
        })
      );

      /*
      await Promise.all(
        Object.keys(allDancer).map(async (dancerName: string) => {
          await ctx.db.Dancer.findOneAndUpdate(
            { name: dancerName },
            { positionData: allDancer[dancerName].positionData }
          );
        })
      );
      */

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

      const deleteControlList = deleteControlFrame.map((data) => {
        return String(data.id);
      });
      const deletePositionList = deletePositionFrame.map((data) => {
        return String(data.id);
      });

      // subscription control
      const controlMapPayload: ControlMapPayload = {
        editBy: ctx.userID,
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
        return String(frame.id);
      });
      const controlRecordPayload: ControlRecordPayload = {
        mutation: ControlRecordMutation.CREATED_DELETED,
        editBy: ctx.userID,
        addID: controlRecordIDs,
        deleteID: deleteControlList,
        updateID: [],
        index,
      };
      await publishControlRecord(controlRecordPayload);

      // subscription position
      const positionMapPayload: PositionMapPayload = {
        editBy: ctx.userID,
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
        return String(frame.id);
      });
      const positionRecordPayload: PositionRecordPayload = {
        mutation: PositionRecordMutation.CREATED_DELETED,
        editBy: ctx.userID,
        addID: positionRecordIDs,
        deleteID: deletePositionList,
        updateID: [],
        index,
      };
      await publishPositionRecord(positionRecordPayload);

      return { ok: true, msg: `Apply effect id: ${id}` };
    }
  }
}
