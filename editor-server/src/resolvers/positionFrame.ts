import {
  Resolver,
  ID,
  Ctx,
  Query,
  Arg,
  Mutation,
  PubSub,
  Publisher,
} from "type-graphql";

import { PositionFrame } from "./types/positionFrame";
import { Dancer } from "./types/dancer";
import { generateID, updateRedisPosition } from "../utility";
import {
  EditPositionFrameInput,
  DeletePositionFrameInput,
} from "./inputs/positionFrame";
import { Topic } from "./subscriptions/topic";
import { PositionMapPayload } from "./subscriptions/positionMap";
import {
  PositionRecordPayload,
  PositionRecordMutation,
} from "./subscriptions/positionRecord";
import redis from "../redis";
import { IDancer, IPosition, IPositionFrame, TContext } from "../types/global";

@Resolver((of) => PositionFrame)
export class PositionFrameResolver {
  @Query((returns) => PositionFrame)
  async positionFrame(@Arg("start") start: number, @Ctx() ctx: TContext) {
    return await ctx.db.PositionFrame.findOne({ start: start });
  }

  @Query((returns) => [ID])
  async positionFrameIDs(@Ctx() ctx: TContext) {
    const frames = await ctx.db.PositionFrame.find().sort({ start: 1 });
    const id = frames.map((frame: PositionFrame) => frame.id);
    return id;
  }

  @Mutation((returns) => PositionFrame)
  async addPositionFrame(
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
    publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("start", { nullable: false }) start: number,
    @Ctx() ctx: TContext
  ) {
    const check = await ctx.db.PositionFrame.findOne({ start });
    if (check) {
      throw new Error(
        `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
      );
    }
    const newPositionFrame = await new ctx.db.PositionFrame({
      start: start,
      fade: false,
      id: generateID(),
    }).save();
    const allDancers = await ctx.db.Dancer.find();
    await Promise.all(
      allDancers.map(async (dancer: Dancer) => {
        const newPosition = new ctx.db.Position({
          frame: newPositionFrame,
          x: 0,
          y: 0,
          z: 0,
          id: generateID(),
        });
        await newPosition.save();
        await ctx.db.Dancer.findOneAndUpdate(
          { id: dancer.id },
          {
            name: dancer.name,
            parts: dancer.parts,
            positionData: dancer.positionData.concat([newPosition]),
            id: dancer.id,
          }
        );
      })
    );
    await updateRedisPosition(newPositionFrame.id);
    const mapPayload: PositionMapPayload = {
      editBy: ctx.username,
      frame: {
        createList: [newPositionFrame.id],
        deleteList: [],
        updateList: [],
      },
    };
    await publishPositionMap(mapPayload);
    const allPositionFrames: IPositionFrame[] =
      await ctx.db.PositionFrame.find().sort({
        start: 1,
      });
    let index = -1;
    await allPositionFrames.map((frame, idx: number) => {
      if (frame.id === newPositionFrame.id) {
        index = idx;
      }
    });
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.CREATED,
      editBy: ctx.username,
      addID: [newPositionFrame.id],
      updateID: [],
      deleteID: [],
      index,
    };
    await publishPositionRecord(recordPayload);
    return newPositionFrame;
  }

  @Mutation((returns) => PositionFrame)
  async editPositionFrame(
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
    publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("input") input: EditPositionFrameInput,
    @Ctx() ctx: TContext
  ) {
    const { start } = input;
    if (start) {
      const check = await ctx.db.PositionFrame.findOne({ start: input.start });
      if (check) {
        if (check.id !== input.frameID) {
          throw new Error(
            `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
          );
        }
      }
    }
    const frameToEdit = await ctx.db.PositionFrame.findOne({
      id: input.frameID,
    });
    if (frameToEdit.editing && frameToEdit.editing !== ctx.username) {
      throw new Error(`The frame is now editing by ${frameToEdit.editing}.`);
    }
    await ctx.db.PositionFrame.updateOne({ id: input.frameID }, input);
    await ctx.db.PositionFrame.updateOne(
      { id: input.frameID },
      { editing: null }
    );
    const positionFrame = await ctx.db.PositionFrame.findOne({
      id: input.frameID,
    });
    await updateRedisPosition(positionFrame.id);
    const payload: PositionMapPayload = {
      editBy: ctx.username,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [positionFrame.id],
      },
    };
    await publishPositionMap(payload);
    const allPositionFrames: IPositionFrame[] =
      await ctx.db.PositionFrame.find().sort({
        start: 1,
      });
    let index = -1;
    await allPositionFrames.map((frame, idx: number) => {
      if (frame.id === positionFrame.id) {
        index = idx;
      }
    });
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.UPDATED,
      editBy: ctx.username,
      addID: [],
      updateID: [positionFrame.id],
      deleteID: [],
      index,
    };
    await publishPositionRecord(recordPayload);
    return positionFrame;
  }

  @Mutation((returns) => PositionFrame)
  async deletePositionFrame(
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap)
    publishPositionMap: Publisher<PositionMapPayload>,
    @Arg("input") input: DeletePositionFrameInput,
    @Ctx() ctx: TContext
  ) {
    const { frameID } = input;
    const frameToDelete = await ctx.db.PositionFrame.findOne({ id: frameID });
    if (frameToDelete.editing && frameToDelete.editing !== ctx.username) {
      throw new Error(`The frame is now editing by ${frameToDelete.editing}.`);
    }
    const _id = frameToDelete._id;
    await ctx.db.PositionFrame.deleteOne({ id: frameID });
    const dancers: IDancer[] = await ctx.db.Dancer.find().populate(
      "positionData"
    );
    Promise.all(
      dancers.map(async (dancer) => {
        const positionToDelete = dancer.positionData.find(
          (position: IPosition) => position.frame.toString() === _id.toString()
        );
        await ctx.db.Dancer.updateOne(
          { id: dancer.id },
          { $pull: { positionData: positionToDelete._id } }
        );
      })
    );

    await ctx.db.Position.deleteMany({ frame: _id });
    const mapPayload: PositionMapPayload = {
      editBy: ctx.username,
      frame: {
        createList: [],
        deleteList: [frameID],
        updateList: [],
      },
    };
    redis.del(frameID);
    await publishPositionMap(mapPayload);
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.DELETED,
      addID: [],
      updateID: [],
      deleteID: [frameID],
      editBy: ctx.username,
      index: -1,
    };
    await publishPositionRecord(recordPayload);
    return frameToDelete;
  }
}
