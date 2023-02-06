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

import { PositionFrame, Dancer } from "../../prisma/generated/type-graphql";
import { updateRedisPosition } from "../utility";
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
import { TContext } from "../types/global";

@Resolver((of) => PositionFrame)
export class PositionFrameResolver {
  @Query((returns) => PositionFrame)
  async positionFrame(@Arg("frameID") frameID: number, @Ctx() ctx: TContext) {
    const frame = await ctx.prisma.positionFrame.findFirst({
      where: { id: frameID },
    });
    if(!frame) throw new Error(`frame id ${frameID} not found`);
    return frame;
  }

  @Query((returns) => [ID])
  async positionFrameIDs(@Ctx() ctx: TContext) {
    const frames = await ctx.prisma.positionFrame.findMany({
      orderBy: { start: "asc" },
    });
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
    const check = await ctx.prisma.positionFrame.findFirst({
      where: { start },
    });
    if (check) {
      throw new Error(
        `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
      );
    }
    const newPositionFrame = await ctx.prisma.positionFrame.create({
      data: {
        start,
      },
    });
    const allDancers: Dancer[] = await ctx.prisma.dancer.findMany();

    await Promise.all(
      allDancers.map(async (dancer: Dancer) => {
        await ctx.prisma.positionData.create({
          data: {
            dancerId: dancer.id,
            frameId: newPositionFrame.id,
            x: 0,
            y: 0,
            z: 0,
          },
        });
      })
    );
    await updateRedisPosition(`POSFRAME_${newPositionFrame.id}`);
    const mapPayload: PositionMapPayload = {
      editBy: ctx.userID,
      frame: {
        createList: [newPositionFrame.id],
        deleteList: [],
        updateList: [],
      },
    };
    await publishPositionMap(mapPayload);
    const allPositionFrames: PositionFrame[]=
      await ctx.prisma.positionFrame.findMany({
        orderBy: { start: "asc" },
      });

    let index = -1;
    allPositionFrames.map((frame, idx: number) => {
      if (frame.id === newPositionFrame.id) {
        index = idx;
      }
    });
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.CREATED,
      editBy: ctx.userID,
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
    if (typeof start==="number") {
      const check = await ctx.prisma.positionFrame.findFirst({
        where: { start },
      });
      if (check && check.id !== input.frameID) {
        throw new Error(
          `Start Time ${start} overlapped! (Overlapped frameID: ${check.id})`
        );
      }
    }
    const frameToEdit = await ctx.prisma.editingPositionFrame.findFirst({
      where: { frameId: input.frameID },
    });
    if (
      frameToEdit &&
      frameToEdit.userId &&
      frameToEdit.userId !== ctx.userID
    ) {
      throw new Error(`The frame is now editing by ${frameToEdit.userId}.`);
    }
    const positionFrame = await ctx.prisma.positionFrame.findFirst({
      where: { id: input.frameID },
      include: { positionDatas: {
        include: { dancer: true, frame: true },
      } },
    });
    if(!positionFrame) throw new Error(`positionFrame id ${input.frameID} not found`);
    const updatePositionFrame = await ctx.prisma.positionFrame.update({
      where: { id: input.frameID },
      data: { id: input.frameID, start: input.start },
    });
    if(!positionFrame) throw new Error("frame id not found");
    await ctx.prisma.editingPositionFrame.update({
      where: { userId: ctx.userID },
      data: { frameId: null },
    });
    await updateRedisPosition(`POSFRAME_${positionFrame.id}`);
    const payload: PositionMapPayload = {
      editBy: ctx.userID,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [positionFrame?.id],
      },
    };
    await publishPositionMap(payload);
    const allPositionFrames: PositionFrame[] =
      await ctx.prisma.positionFrame.findMany({
        orderBy: { start: "asc" },
      });
    let index = -1;
    allPositionFrames.map((frame, idx: number) => {
      if (frame.id === positionFrame?.id) {
        index = idx;
      }
    });
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.UPDATED,
      editBy: ctx.userID,
      addID: [],
      updateID: [positionFrame.id],
      deleteID: [],
      index,
    };
    await publishPositionRecord(recordPayload);
    return updatePositionFrame;
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
    const frameToDelete = await ctx.prisma.editingPositionFrame.findFirst({
      where: { frameId: frameID },
    });
    if (
      frameToDelete &&
      frameToDelete.userId &&
      frameToDelete.userId !== ctx.userID
    ) {
      throw new Error(`The frame is now editing by ${frameToDelete.userId}.`);
    }
    const deletedFrame = await ctx.prisma.positionFrame.findFirst({
      where: { id: frameID },
      include: {
        positionDatas: {
          include: { dancer: true, frame: true },
        }
      }
    });
    if(!deletedFrame) throw new Error("frame id not found");
    await ctx.prisma.positionFrame.delete({ where: { id: frameID } });
    await ctx.prisma.editingPositionFrame.update({
      where: { userId: ctx.userID },
      data: { frameId: null },
    });
    // const dancers: Dancer[] = await ctx.prisma.dancer.findMany({
    //   include: { positionData: true },
    // });
    // Promise.all(
    //   dancers.map(async (dancer) => {
    //     await ctx.prisma.dancer.update({
    //       where: { id: dancer.id },
    //       data: {
    //         positionData: {
    //           disconnect: {
    //             dancerId_frameId: {
    //               dancerId: dancer.id,
    //               frameId: frameID,
    //             },
    //           },
    //         },
    //       },
    //     });
    //   })
    // );

    // await ctx.prisma.positionData.deleteMany({ where: { frameId: frameID } });
    const mapPayload: PositionMapPayload = {
      editBy: ctx.userID,
      frame: {
        createList: [],
        deleteList: [frameID],
        updateList: [],
      },
    };
    redis.del(`POSFRAME_${frameID}`);
    await publishPositionMap(mapPayload);
    const recordPayload: PositionRecordPayload = {
      mutation: PositionRecordMutation.DELETED,
      addID: [],
      updateID: [],
      deleteID: [frameID],
      editBy: ctx.userID,
      index: -1,
    };
    await publishPositionRecord(recordPayload);
    // return deletedFrame;
  }
}