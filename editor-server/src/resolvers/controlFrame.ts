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

import { ControlFrame } from "./types/controlFrame";
import {
  EditControlFrameInput,
  DeleteControlFrameInput,
} from "./inputs/controlFrame";
import { Part } from "./types/part";
import { generateID, updateRedisControl } from "../utility";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import {
  ControlRecordMutation,
  ControlRecordPayload,
} from "./subscriptions/controlRecord";
import redis from "../redis";
import { IControl, IControlFrame, IPart, TContext } from "../types/global";

@Resolver((of) => ControlFrame)
export class ControlFrameResolver {
  @Query((returns) => ControlFrame)
  async controlFrame(@Arg("frameID") frameID: string, @Ctx() ctx: TContext) {
    return await ctx.db.ControlFrame.findOne({ id: frameID });
  }

  @Query((returns) => [ID])
  async controlFrameIDs(@Ctx() ctx: TContext) {
    const frames = await ctx.db.ControlFrame.find().sort({ start: 1 });
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
    const check = await ctx.db.ControlFrame.findOne({ start });
    if (check) {
      throw new Error(
        `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
      );
    }
    const newControlFrame = await new ctx.db.ControlFrame({
      start: start,
      fade: fade,
      id: generateID(),
    }).save();
    const allParts = await ctx.db.Part.find();
    await Promise.all(
      allParts.map(async (part: Part) => {
        const newControl = await new ctx.db.Control({
          frame: newControlFrame,
          value: ControlDefault[part.type],
          id: generateID(),
        });
        await newControl.save();
        await ctx.db.Part.findOneAndUpdate(
          { id: part.id },
          {
            name: part.name,
            type: part.type,
            controlData: part.controlData.concat([newControl]),
            id: part.id,
          }
        );
      })
    );
    await updateRedisControl(newControlFrame.id);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.username,
      frame: {
        createList: [newControlFrame.id],
        deleteList: [],
        updateList: [],
      },
    };
    await publishControlMap(mapPayload);
    const allControlFrames: IControlFrame[] =
      await ctx.db.ControlFrame.find().sort({
        start: 1,
      });
    let index = -1;
    await allControlFrames.map((frame, idx: number) => {
      if (frame.id === newControlFrame.id) {
        index = idx;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.CREATED,
      editBy: ctx.username,
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
      const check = await ctx.db.ControlFrame.findOne({ start: input.start });
      if (check) {
        if (check.id !== input.frameID) {
          throw new Error(
            `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
          );
        }
      }
    }
    const frameToEdit = await ctx.db.ControlFrame.findOne({
      id: input.frameID,
    });
    if (frameToEdit.editing && frameToEdit.editing !== ctx.username) {
      throw new Error(`The frame is now editing by ${frameToEdit.editing}.`);
    }
    await ctx.db.ControlFrame.updateOne({ id: input.frameID }, input);
    await ctx.db.ControlFrame.updateOne(
      { id: input.frameID },
      { editing: null }
    );

    const controlFrame = await ctx.db.ControlFrame.findOne({
      id: input.frameID,
    });
    await updateRedisControl(controlFrame.id);
    const payload: ControlMapPayload = {
      editBy: ctx.username,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [controlFrame.id],
      },
    };
    await publishControlMap(payload);
    const allControlFrames: IControlFrame[] =
      await ctx.db.ControlFrame.find().sort({
        start: 1,
      });
    let index = -1;
    await allControlFrames.map((frame, idx: number) => {
      if (frame.id === controlFrame.id) {
        index = idx;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.UPDATED,
      editBy: ctx.username,
      addID: [],
      updateID: [controlFrame.id],
      deleteID: [],
      index,
    };
    await publishControlRecord(recordPayload);
    return controlFrame;
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
    const frameToDelete = await ctx.db.ControlFrame.findOne({ id: frameID });
    if (frameToDelete.editing && frameToDelete.editing !== ctx.username) {
      throw new Error(`The frame is now editing by ${frameToDelete.editing}.`);
    }
    const _id = frameToDelete._id;
    await ctx.db.ControlFrame.deleteOne({ id: frameID });
    const parts: IPart[] = await ctx.db.Part.find().populate("controlData");

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
    await redis.del(frameID);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.username,
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
      editBy: ctx.username,
      index: -1,
    };
    await publishControlRecord(recordPayload);
    return frameToDelete;
  }
}
