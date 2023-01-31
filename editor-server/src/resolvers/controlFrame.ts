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

// import { ControlFrame } from "./types/controlFrame";
import {
  EditControlFrameInput,
  DeleteControlFrameInput,
} from "./inputs/controlFrame";
// import { Part } from "./types/part";
import { ControlFrame, Part } from "../../prisma/generated/type-graphql";
import { generateID, updateRedisControl } from "../utility";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import {
  ControlRecordMutation,
  ControlRecordPayload,
} from "./subscriptions/controlRecord";
import redis from "../redis";
import { TContext } from "../types/global";
import { ControlData } from "@prisma/client";
import { disconnect } from "process";

@Resolver((of) => ControlFrame)
export class ControlFrameResolver {
  @Query((returns) => ControlFrame)
  async controlFrame(@Arg("frameID") frameID: number, @Ctx() ctx: TContext) {
    // return await ctx.db.ControlFrame.findOne({ id: frameID });
    return await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
    });
  }

  @Query((returns) => [ID])
  async controlFrameIDs(@Ctx() ctx: TContext) {
    // const frames = await ctx.db.ControlFrame.find().sort({ start: 1 });
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
    // const check = await ctx.db.ControlFrame.findOne({ start });
    const check = await ctx.prisma.controlFrame.findFirst({
      where: { start },
    });
    if (check) {
      throw new Error(
        `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
      );
    }
    // const newControlFrame = await new ctx.db.ControlFrame({
    //   start: start,
    //   fade: fade,
    //   id: generateID(),
    // }).save();
    const newControlFrame = await ctx.prisma.controlFrame.create({
      data: {
        start,
        fade
      }
    });
    // const allParts = await ctx.db.Part.find();
    const allParts = await ctx.prisma.part.findMany();
    await Promise.all(
      allParts.map(async (part: Part) => {
        // const newControl = await new ctx.db.Control({
        //   frame: newControlFrame,
        //   value: ControlDefault[part.type],
        //   id: generateID(),
        // });
        await ctx.prisma.controlData.create({
          data: {
            frameId: newControlFrame.id,
            partId: part.id,
            value: ControlDefault[part.type],
          }
        });
        // await newControl.save();
        // await ctx.db.Part.findOneAndUpdate(
        //   { id: part.id },
        //   {
        //     name: part.name,
        //     type: part.type,
        //     controlData: part.controlData.concat([newControl]),
        //     id: part.id,
        //   }
        // );
        await ctx.prisma.part.update({
          where: { id: part.id },
          data: {
            controlData: {
              connect: {
                partId_frameId: {
                  partId: part.id,
                  frameId: newControlFrame.id,
                }
              }
            },
          }
        });
      })
    );
    await updateRedisControl(newControlFrame.id);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.userID,
      frame: {
        createList: [newControlFrame.id],
        deleteList: [],
        updateList: [],
      },
    };
    await publishControlMap(mapPayload);
    // const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find().sort({
    //   start: 1,
    // });
    const allControlFrames: ControlFrame[] = await ctx.prisma.controlFrame.findMany({
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
      editBy: ctx.userID,
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
      // const check = await ctx.db.ControlFrame.findOne({ start: input.start });
      const check = await ctx.prisma.controlFrame.findFirst({
        where: { start: input.start },
      });
      if (check) {
        if (check.id !== input.frameID) {
          throw new Error(
            `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
          );
        }
      }
    }
    // const frameToEdit = await ctx.db.ControlFrame.findOne({ id: input.frameID });
    const frameToEdit = await ctx.prisma.controlFrame.findFirst({
      where: { id: input.frameID },
      include: { editing: true }
    });
    if (!frameToEdit) throw new Error("Frame not found!");
    if (frameToEdit.editing && frameToEdit.editing.userId !== ctx.userID) {
      throw new Error(`The frame is now editing by ${frameToEdit.editing}.`);
    }
    // await ctx.db.ControlFrame.updateOne({ id: input.frameID }, input);
    const controlFrame = await ctx.prisma.controlFrame.update({
      where: { id: input.frameID },
      data: { ...input, editing: undefined },
    });
    // await ctx.db.ControlFrame.updateOne(
    //   { id: input.frameID },
    //   { editing: null }
    // );

    // const controlFrame = await ctx.db.ControlFrame.findOne({
    //   id: input.frameID,
    // });
    await updateRedisControl(controlFrame.id);
    const payload: ControlMapPayload = {
      editBy: ctx.userID,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [controlFrame.id],
      },
    };
    await publishControlMap(payload);
    // const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find().sort({
    //   start: 1,
    // });
    const allControlFrames: ControlFrame[] = await ctx.prisma.controlFrame.findMany({
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
      editBy: ctx.userID,
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
    // const frameToDelete = await ctx.db.ControlFrame.findOne({ id: frameID });
    const frameToDelete = await ctx.prisma.controlFrame.findFirst({
      where: { id: frameID },
      include: { editing: true }
    });
    if (!frameToDelete) throw new Error("Frame not found!");
    if (frameToDelete.editing && frameToDelete.editing.userId !== ctx.userID) {
      throw new Error(`The frame is now editing by ${frameToDelete.editing}.`);
    }
    // await ctx.db.ControlFrame.deleteOne({ id: frameID });
    await ctx.prisma.controlFrame.delete({ where: { id: frameID } });
    // const parts: IPart[] = await ctx.db.Part.find().populate("controlData");
    // await Promise.all(
    //   parts.map(async (part) => {
    //     if(!part.controlData) throw new Error("Control data not found!");
    //     const controlToDelete = part.controlData.find(
    //       (control: ControlData) => control.frameId === frameID
    //     );
    //     if (!controlToDelete) throw new Error("Deleted Control data not found!");
    //     await ctx.db.Part.updateOne(
    //       { id: part.id },
    //       { $pull: { controlData: controlToDelete._id } }
    //     );
    //   })
    // );
    const parts = await ctx.prisma.part.findMany({
      where: {
        controlData: {
          some: {
            frameId: frameID
          }
        }
      },
      include: { controlData: true }
    });
    await Promise.all(
      parts.map(async (part)=>{
        if(!part.controlData) throw new Error("Control data not found!");
        await ctx.prisma.part.update({
          where: { id: part.id },
          data: {
            controlData: {
              delete: [{partId_frameId:{
                partId: part.id,
                frameId: frameID
              }}]
            }
          }
        });
      })
    );
    // await ctx.db.Control.deleteMany({ frame: _id });
    await redis.del(`controlframe-${frameID}`);
    const mapPayload: ControlMapPayload = {
      editBy: ctx.userID,
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
      editBy: ctx.userID,
      index: -1,
    };
    await publishControlRecord(recordPayload);
    return frameToDelete;
  }
}
