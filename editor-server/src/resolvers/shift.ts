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

interface LooseObject {
  [key: string]: any;
}

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
    @Ctx() ctx: any
  ) {
    // check negetive
    if (start + move < 0) {
      return {
        ok: false,
        msg: `Negative start is not legal`,
      };
    }

    // check start after end
    if (start >= end) {
      return {
        ok: false,
        msg: `start must smaller than end`,
      };
    }

    // check editing of control
    if (shiftControl) {
      // check target area
      const checkControlEditing = await ctx.db.ControlFrame.findOne({
        start: { $lte: end + move, $gte: start + move },
        editing: { $nin: [null, ""] },
      });
      if (checkControlEditing)
        return {
          ok: false,
          msg: `User ${checkControlEditing.editing} is editing frame ${checkControlEditing.id}`,
        };

      // check source area
      const checkOldControlEditing = await ctx.db.ControlFrame.findOne({
        start: { $lte: end, $gte: start },
        editing: { $nin: [null, ""] },
      });
      if (checkOldControlEditing)
        return {
          ok: false,
          msg: `User ${checkOldControlEditing.editing} is editing frame ${checkOldControlEditing.id}`,
        };
    }

    // check editing of position
    if (shiftPosition) {
      // check target area
      const checkPositionEditing = await ctx.db.PositionFrame.findOne({
        start: { $lte: end + move, $gte: start + move },
        editing: { $nin: [null, ""] },
      });
      if (checkPositionEditing)
        return {
          ok: false,
          msg: `User ${checkPositionEditing.editing} is editing frame ${checkPositionEditing.id}`,
        };

      // check source area
      const checkOldPositionEditing = await ctx.db.PositionFrame.findOne({
        start: { $lte: end, $gte: start },
        editing: { $nin: [null, ""] },
      });
      if (checkOldPositionEditing)
        return {
          ok: false,
          msg: `User ${checkOldPositionEditing.editing} is editing frame ${checkOldPositionEditing.id}`,
        };
    }

    // clear
    let deleteControlFrame = [];
    let deletePositionFrame = [];
    if (move > 0) {
      if (start + move > end) {
        // clear region: [ start + move, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.db.ControlFrame.find({
            start: { $lte: end + move, $gte: start + move },
          });
          await ctx.db.ControlFrame.deleteMany({
            start: { $lte: end + move, $gte: start + move },
          });
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.db.PositionFrame.find({
            start: { $lte: end + move, $gte: start + move },
          });
          await ctx.db.PositionFrame.deleteMany({
            start: { $lte: end + move, $gte: start + move },
          });
        }
      } else {
        // clear region: ( end, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.db.ControlFrame.find({
            start: { $lte: end + move, $gt: end },
          });
          await ctx.db.ControlFrame.deleteMany({
            start: { $lte: end + move, $gt: end },
          });
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.db.PositionFrame.find({
            start: { $lte: end + move, $gt: end },
          });
          await ctx.db.PositionFrame.deleteMany({
            start: { $lte: end + move, $gt: end },
          });
        }
      }
    } else {
      if (end + move >= start) {
        // clear region: [ start + move, start)
        if (shiftControl) {
          deleteControlFrame = await ctx.db.ControlFrame.find({
            start: { $lt: start, $gte: start + move },
          });
          await ctx.db.ControlFrame.deleteMany({
            start: { $lt: start, $gte: start + move },
          });
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.db.PositionFrame.find({
            start: { $lt: start, $gte: start + move },
          });
          await ctx.db.PositionFrame.deleteMany({
            start: { $lt: start, $gte: start + move },
          });
        }
      } else {
        // clear region: [ start + move, end + move]
        if (shiftControl) {
          deleteControlFrame = await ctx.db.ControlFrame.find({
            start: { $lte: end + move, $gte: start + move },
          });
          await ctx.db.ControlFrame.deleteMany({
            start: { $lte: end + move, $gte: start + move },
          });
        }
        if (shiftPosition) {
          deletePositionFrame = await ctx.db.PositionFrame.find({
            start: { $lte: end + move, $gte: start + move },
          });
          await ctx.db.PositionFrame.deleteMany({
            start: { $lte: end + move, $gte: start + move },
          });
        }
      }
    }

    // updating part's controlData
    const parts = await ctx.db.Part.find().populate("controlData");
    await Promise.all(
      deleteControlFrame.map(async (data: any) => {
        const { _id, id } = data;
        await Promise.all(
          parts.map(async (part: any) => {
            const controlToDelete = part.controlData.find(
              (control: any) => control.frame.toString() === _id.toString()
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

    // updating dancer's positionData
    await Promise.all(
      deletePositionFrame.map(async (data: any) => {
        const { id, _id } = data;
        const dancers = await ctx.db.Dancer.find().populate("positionData");
        Promise.all(
          dancers.map(async (dancer: any) => {
            const positionToDelete = dancer.positionData.find(
              (position: any) => position.frame.toString() === _id.toString()
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

    // shift
    // control
    if (shiftControl) {
      // find source data
      const updateControlFrames = await ctx.db.ControlFrame.find({
        start: { $lte: end, $gte: start },
      }).sort({
        start: 1,
      });
      // update redis
      const updateControlIDs: string[] = await Promise.all(
        updateControlFrames.map(async (obj: any) => {
          const { id } = obj;
          await ctx.db.ControlFrame.updateOne(
            { id },
            { $inc: { start: move } }
          );
          await updateRedisControl(id);
          return id;
        })
      );

      // get id list of deleteControl
      const deleteControlList = deleteControlFrame.map((data: any) => {
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

      const allControlFrames = await ctx.db.ControlFrame.find().sort({
        start: 1,
      });
      let index = -1;
      await allControlFrames.map((frame: any, idx: number) => {
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

    // position
    if (shiftPosition) {
      // find source data
      const updatePositionFrames = await ctx.db.PositionFrame.find({
        start: { $lte: end, $gte: start },
      }).sort({
        start: 1,
      });

      // update redis
      const updatePositionIDs: string[] = await Promise.all(
        updatePositionFrames.map(async (obj: any) => {
          const { id } = obj;
          await ctx.db.PositionFrame.updateOne(
            { id },
            { $inc: { start: move } }
          );
          await updateRedisPosition(id);
          return id;
        })
      );

      // get id list of deletePosition
      const deletePositionList = deletePositionFrame.map((data: any) => {
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

      let index = -1;
      const allPositionFrames = await ctx.db.PositionFrame.find().sort({
        start: 1,
      });
      index = -1;
      await allPositionFrames.map((frame: any, idx: number) => {
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

    return { ok: true, msg: `Done` };
  }
}
