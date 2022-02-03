import {
  Resolver,
  Query,
  Mutation,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  Float,
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
import { generateID, updateRedis } from "../utility";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import {
  ControlMapPayload,
  ControlMapMutation,
} from "./subscriptions/controlMap";
import {
  ControlRecordMutation,
  ControlRecordPayload,
} from "./subscriptions/controlRecord";
import redis from "../redis"

@Resolver((of) => ControlFrame)
export class ControlFrameResolver {
  @Query((returns) => ControlFrame)
  async controlFrame(@Arg("start") start: number, @Ctx() ctx: any) {
    return await ctx.db.ControlFrame.findOne({ start: start });
  }

  @Query((returns) => [ID])
  async controlFrameIDs(@Ctx() ctx: any) {
    let frames = await ctx.db.ControlFrame.find().sort({ start: 1 });
    const id = frames.map((frame: ControlFrame) => frame.id);
    return id;
  }
  // @FieldResolver()
  // async id(@Root() controlframe: any, @Ctx() ctx: any) {
  //     return controlframe._id
  // }

  @Mutation((returns) => ControlFrame)
  async addControlFrame(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Ctx() ctx: any
  ) {
    const check = await ctx.db.ControlFrame.findOne({ start });
    if (check) {
      throw new Error("Start Time overlapped!");
    }
    const newControlFrame = await new ctx.db.ControlFrame({
      start: start,
      fade: false,
      id: generateID(),
    }).save();
    let allParts = await ctx.db.Part.find();
    await Promise.all(
      allParts.map(async (part: Part) => {
        let newControl = await new ctx.db.Control({
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
    )
    await updateRedis(newControlFrame.id)
    const mapPayload: ControlMapPayload = {
      mutation: ControlMapMutation.CREATED,
      editBy: ctx.userID,
      frameID: newControlFrame.id,
      frame: [{ _id: newControlFrame._id, id: newControlFrame.id }],
    };
    await publishControlMap(mapPayload);
    const allControlFrames = await ctx.db.ControlFrame.find().sort({
      start: 1,
    });
    let index = -1;
    await allControlFrames.map((frame: any, idx: number) => {
      if (frame.id === newControlFrame.id) {
        index = idx;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.CREATED,
      editBy: ctx.userID,
      frameID: newControlFrame.id,
      index,
    };
    await publishControlRecord(recordPayload);
    return newControlFrame;
  }

  @Mutation((returns) => ControlFrame)
  async editControlFrame(
    @PubSub(Topic.ControlRecord)
    publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
    @Arg("input") input: EditControlFrameInput,
    @Ctx() ctx: any
  ) {
    const { start } = input;
    if (start) {
      const check = await ctx.db.ControlFrame.findOne({ start: input.start });
      if (check) {
        if (check.id !== input.id) {
          throw new Error("Start Time overlapped!");
        }
      }
    }
    let frameToEdit = await ctx.db.ControlFrame.findOne({ id: input.id });
    if (frameToEdit.editing && frameToEdit.editing !== ctx.userID) {
      throw new Error("The frame is now editing by other user.");
    }
    await ctx.db.ControlFrame.updateOne({ id: input.id }, input);
    await ctx.db.ControlFrame.updateOne({ id: input.id }, { editing: null });

    const controlFrame = await ctx.db.ControlFrame.findOne({ id: input.id });
    await updateRedis(controlFrame.id)
    const payload: ControlMapPayload = {
      mutation: ControlMapMutation.CREATED,
      editBy: ctx.userID,
      frameID: controlFrame.id,
      frame: [{ _id: controlFrame._id, id: controlFrame.id }],
    };
    await publishControlMap(payload);
    const allControlFrames = await ctx.db.ControlFrame.find().sort({
      start: 1,
    });
    let index = -1;
    await allControlFrames.map((frame: any, idx: number) => {
      if (frame.id === controlFrame.id) {
        index = idx;
      }
    });
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.UPDATED,
      editBy: ctx.userID,
      frameID: controlFrame.id,
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
    @Ctx() ctx: any
  ) {
    const { id } = input;
    const frameToDelete = await ctx.db.ControlFrame.findOne({ id });
    if (frameToDelete.editing && frameToDelete.editing !== ctx.userID) {
      throw new Error("The frame is now editing by other user.");
    }
    const _id = frameToDelete._id;
    await ctx.db.ControlFrame.deleteOne({ id });
    const parts = await ctx.db.Part.find().populate("controlData");
    await Promise.all(
      parts.map(async (part: any) => {
        await ctx.db.Part.updateOne(
          { id: part.id },
          { $pull: { controlData: { frame: _id } } }
        );
      })
    );
    await ctx.db.Control.deleteMany({ frame: _id });
    await redis.del(id)
    const mapPayload: ControlMapPayload = {
      mutation: ControlMapMutation.DELETED,
      editBy: ctx.userID,
      frameID: id,
    };
    await publishControlMap(mapPayload);
    const recordPayload: ControlRecordPayload = {
      mutation: ControlRecordMutation.DELETED,
      frameID: id,
      editBy: ctx.userID,
      index: -1,
    };
    await publishControlRecord(recordPayload);
    return frameToDelete;
  }
}
