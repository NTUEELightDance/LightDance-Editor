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
import { EffectList } from "./types/effectList";
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
import { IControl, IControlFrame, IDancer, IEffectList, IPart, IPosition, IPositionFrame, TRedisControl, TRedisControls, TRedisPosition, TRedisPositions } from "../types/global";

type AllDancer = {
  [key: string]: {
    part: AllPart;
    positionData: IPosition[];
  }
}
type AllPart = {
  [key: string]: {
    type: string;
    id: string;
  }
}
type PartUpdate = {
  [key: string]: IControl[];
}

@Resolver((of) => EffectList)
export class EffectListResolver {
  @Query((returns) => [EffectList])
  async effectList(@Ctx() ctx: any) {
    const effectLists = await ctx.db.EffectList.find();
    const result = effectLists.map((effectList: any) => {
      let { start, end, _id, description, controlFrames, positionFrames } =
        effectList;
      if (!controlFrames) controlFrames = {};
      if (!positionFrames) positionFrames = {};
      return {
        start,
        end,
        id: _id,
        description,
        data: { control: controlFrames, position: positionFrames },
      };
    });
    return result;
  }

  @Mutation((returns) => EffectList)
  async addEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Arg("end", { nullable: false }) end: number,
    @Arg("description", { nullable: true }) description: string,
    @Ctx() ctx: any
  ) {
    const controlFrameIDs = await ctx.db.ControlFrame.find(
      { start: { $lte: end, $gte: start } },
      "id"
    );
    const positionFrameIDs = await ctx.db.PositionFrame.find(
      { start: { $lte: end, $gte: start } },
      "id"
    );
    const controlFrames: TRedisControls = {};
    await Promise.all(
      controlFrameIDs.map(async (controlFrameID: {id: string}) => {
        const { id } = controlFrameID;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisControl = JSON.parse(cache);
          delete cacheObj.editing;
          controlFrames[id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    const positionFrames: TRedisPositions = {};
    await Promise.all(
      positionFrameIDs.map(async (positionFrameID: {id: string}) => {
        const { id } = positionFrameID;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisPosition = JSON.parse(cache);
          delete cacheObj.editing;
          positionFrames[id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    const effectList = await ctx.db
      .EffectList({ start, end, description, controlFrames, positionFrames })
      .save();
    const result = {
      start,
      end,
      description,
      id: effectList._id,
      data: { control: controlFrames, position: positionFrames },
    };
    const payload: EffectListPayload = {
      mutation: EffectListMutation.CREATED,
      editBy: ctx.userID,
      effectListID: effectList._id,
      effectListData: result,
    };
    await publish(payload);
    return result;
  }

  @Mutation((returns) => EffectListResponse)
  async deleteEffectList(
    @PubSub(Topic.EffectList) publish: Publisher<EffectListPayload>,
    @Arg("id", (type) => ID, { nullable: false }) id: string,
    @Ctx() ctx: any
  ) {
    await ctx.db.EffectList.deleteOne({ _id: id });
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
    @Ctx() ctx: any
  ) {
    const effectList: IEffectList = await ctx.db.EffectList.findById(id);
    const end = start - effectList.start + effectList.end;

    // check editing in target area
    if (clear) {
      const checkControlEditing = await ctx.db.ControlFrame.findOne({
        start: { $lte: end, $gte: start },
        editing: { $nin: [null, ""] },
      });
      if (checkControlEditing)
        return {
          ok: false,
          msg: `User ${checkControlEditing.editing} is editing frame ${checkControlEditing.id}`,
        };
      const checkPositionEditing = await ctx.db.PositionFrame.findOne({
        start: { $lte: end, $gte: start },
        editing: { $nin: [null, ""] },
      });
      if (checkPositionEditing)
        return {
          ok: false,
          msg: `User ${checkPositionEditing.editing} is editing frame ${checkPositionEditing.id}`,
        };
    }

    // check overlapping
    let checkOverLap = false;
    if (!clear) {
      await Promise.all(
        Object.values(effectList.controlFrames).map(
          async (controlObject) => {
            const new_start = controlObject.start - effectList.start + start;
            const checkControlOverlap = await ctx.db.ControlFrame.findOne({
              start: new_start,
            });
            if (checkControlOverlap) checkOverLap = true;
          }
        )
      );
      await Promise.all(
        Object.values(effectList.positionFrames).map(
          async (positionObject) => {
            const new_start = positionObject.start - effectList.start + start;
            const checkPositionOverlap = await ctx.db.PositionFrame.findOne({
              start: new_start,
            });
            if (checkPositionOverlap) checkOverLap = true;
          }
        )
      );
    }
    if (checkOverLap) return { ok: false, msg: "Some frame is overlap" };

    // clear
    const deleteControlFrame: IControlFrame[] = await ctx.db.ControlFrame.find({
      start: { $lte: end, $gte: start },
    });
    const deletePositionFrame: IPositionFrame[] = await ctx.db.PositionFrame.find({
      start: { $lte: end, $gte: start },
    });
    if (clear) {
      const parts: IPart[] = await ctx.db.Part.find().populate("controlData");
      await ctx.db.ControlFrame.deleteMany({
        start: { $lte: end, $gte: start },
      });
      await ctx.db.PositionFrame.deleteMany({
        start: { $lte: end, $gte: start },
      });
      await Promise.all(
        deleteControlFrame.map(async (data) => {
          const id = data.id;
          const _id = data._id!;
          await Promise.all(
            parts.map(async (part) => {
              const controlToDelete = part.controlData.find(
                (control: IControl) => control.frame.toString() === _id.toString()
              );
              await ctx.db.Part.updateOne(
                { id: part.id },
                { $pull: { controlData: controlToDelete._id } }
              );
            })
          );
          await ctx.db.Control.deleteMany({ frame: _id });
          await redis.del(id);
        })
      );
      await Promise.all(
        deletePositionFrame.map(async (data) => {
          const id = data.id;
          const _id = data._id!;
          const dancers: IDancer[] = await ctx.db.Dancer.find().populate("positionData");
          Promise.all(
            dancers.map(async (dancer) => {
              const positionToDelete = dancer.positionData.find(
                (position) => position.frame.toString() === _id.toString()
              );
              await ctx.db.Dancer.updateOne(
                { id: dancer.id },
                { $pull: { positionData: positionToDelete._id } }
              );
            })
          );
          redis.del(id);
          await ctx.db.Position.deleteMany({ frame: _id });
        })
      );
    }

    const dancer: IDancer[] = await ctx.db.Dancer.find({}).populate({
      path: "parts",
    });
    const allDancer: AllDancer = {};
    const partUpdate: PartUpdate = {};
    dancer.map(async (dancerObj) => {
      const { parts, name, positionData } = dancerObj;
      const allPart: AllPart = {};
      parts.map((partObj: IPart) => {
        const { type, name, controlData } = partObj;
        const _id = partObj._id!.toString();
        allPart[name] = { type, id: _id };
        partUpdate[_id] = controlData;
      });
      allDancer[name] = { part: allPart, positionData };
    });

    // add
    const newControlFrameIDs: string[] = [];
    const newPositionFrameIDs: string[] = [];
    await Promise.all(
      Object.values(effectList.controlFrames).map(async (frameObj) => {
        const new_start = frameObj.start - effectList.start + start;
        const { fade, status } = frameObj;
        const frame = await new ctx.db.ControlFrame({
          fade,
          start: new_start,
          id: generateID(),
        }).save();

        newControlFrameIDs.push(frame.id);
        await Promise.all(
          Object.keys(status).map(async (dancer: string) => {
            await Promise.all(
              Object.keys(status[dancer]).map(async (part: string) => {
                const { id, type } = allDancer[dancer].part[part];
                let value = status[dancer][part];
                if (type == "EL") {
                  value = { value };
                }
                const controlID: IControl = await new ctx.db.Control({
                  frame: frame._id,
                  value,
                })
                  .save()
                  .then((value: IControl) => value._id);
                partUpdate[id].push(controlID);
              })
            );
          })
        );
      })
    );
    await Promise.all(
      Object.keys(partUpdate).map(async (partID) => {
        await ctx.db.Part.findOneAndUpdate(
          { _id: partID },
          { controlData: partUpdate[partID] }
        );
      })
    );

    await Promise.all(
      Object.values(effectList.positionFrames).map(async (frameObj) => {
        const new_start = frameObj.start - effectList.start + start;
        const { pos } = frameObj;
        const positionFrame = await new ctx.db.PositionFrame({
          start: new_start,
          id: generateID(),
        }).save();

        newPositionFrameIDs.push(positionFrame.id);
        const frame = positionFrame._id;
        await Promise.all(
          Object.keys(pos).map(async (dancer: string) => {
            const { x, y, z } = pos[dancer];
            const positionData = await new ctx.db.Position({
              x,
              y,
              z,
              frame,
            }).save();
            allDancer[dancer].positionData.push(positionData._id);
          })
        );
      })
    );

    await Promise.all(
      Object.keys(allDancer).map(async (dancerName: string) => {
        await ctx.db.Dancer.findOneAndUpdate(
          { name: dancerName },
          { positionData: allDancer[dancerName].positionData }
        );
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

    const deleteControlList = deleteControlFrame.map((data) => {
      return data.id;
    });
    const deletePositionList = deletePositionFrame.map((data) => {
      return data.id;
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

    const newControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find({
      start: { $gte: start, $lte: end },
    }).sort({
      start: 1,
    });
    const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find().sort({
      start: 1,
    });
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

    const newPositionFrames: IPositionFrame[] = await ctx.db.PositionFrame.find({
      start: { $gte: start, $lte: end },
    }).sort({
      start: 1,
    });
    const allPositionFrames: IPositionFrame[] = await ctx.db.PositionFrame.find().sort({
      start: 1,
    });
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
