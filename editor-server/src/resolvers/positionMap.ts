import {
  Resolver,
  Ctx,
  Arg,
  Query,
  Mutation,
  PubSub,
  Publisher,
} from "type-graphql";

import { PosData } from "./types/posData";
import { Map } from "./types/map";
import { EditPositionInput } from "./inputs/position";
import { Topic } from "./subscriptions/topic";
import { PositionMapPayload } from "./subscriptions/positionMap";
import { updateRedisPosition } from "../utility";
import {
  PositionRecordPayload,
  PositionRecordMutation,
} from "./subscriptions/positionRecord";
import { TContext } from "../types/global";
import { Dancer, PositionFrame } from "../../prisma/generated/type-graphql";

@Resolver((of) => Map)
export class PosMapResolver {
  @Query((returns) => Map)
  async PosMap(@Ctx() ctx: TContext) {
    const frames: PositionFrame[] = await ctx.prisma.positionFrame.findMany();
    const id = frames.map((frame) => {
      return { id: frame.id };
    });
    return { frames: id };
  }
}

@Resolver((of) => PosData)
export class EditPosMapResolver {
  @Mutation((returns) => Map)
  async editPosMap(
    @PubSub(Topic.PositionRecord)
      publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap) publish: Publisher<PositionMapPayload>,
    @Arg("positionData", (type) => [EditPositionInput])
      positionData: EditPositionInput[],
    @Arg("start") startTime: number,
    @Ctx() ctx: TContext
  ) {
    // find a position frame
    const positionFrame = await ctx.prisma.positionFrame.findFirst({
      where: { start: startTime },
    });

    // if position frame not found
    if (!positionFrame) {
      const newPositionFrame = await ctx.prisma.positionFrame.create({
        data: {
          start: startTime,
        },
      });

      // check payload
      const dancers = await ctx.prisma.dancer.findMany();
      if (positionData.length !== dancers.length) {
        throw new Error(
          `Not all dancers in payload. Missing number: ${
            dancers.length - positionData.length
          }`
        );
      }
      await Promise.all(
        positionData.map(async (data) => {
          const { dancerName } = data;
          const dancer = await ctx.prisma.dancer.findFirst({
            where: { name: dancerName },
          });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
        })
      );

      // add new positions
      await Promise.all(
        positionData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancer = await ctx.prisma.dancer.findFirst({
            where: { name: dancerName },
          });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
          const dancerId = dancer.id;

          // push
          await ctx.prisma.dancer.update({
            where: { id: dancerId },
            data: {
              positionData: {
                connect: [
                  {
                    dancerId_frameId: {
                      dancerId: dancerId,
                      frameId: newPositionFrame.id,
                    },
                  },
                ],
              },
            },
          });
        })
      );
      await updateRedisPosition(newPositionFrame.id);
      // subscription
      const mapPayload: PositionMapPayload = {
        editBy: ctx.userID,
        frame: {
          createList: [newPositionFrame.id],
          deleteList: [],
          updateList: [],
        },
      };
      await publish(mapPayload);

      const allPositionFrames: PositionFrame[] =
        await ctx.prisma.positionFrame.findMany({
          orderBy: {
            start: "asc",
          },
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
      return {
        frames: newPositionFrame,
      };
    }

    // if position frame found
    else {
      const { id: frameID } = positionFrame;
      const frameToEdit = await ctx.prisma.editingPositionFrame.findFirst({
        where: { frameId: frameID },
      });
      if (
        frameToEdit &&
        frameToEdit.userId &&
        frameToEdit.userId !== ctx.userID
      ) {
        throw new Error(`The frame is now editing by ${frameToEdit.userId}.`);
      }

      // check payload
      const dancers = await ctx.prisma.dancer.findMany();
      if (positionData.length !== dancers.length) {
        throw new Error(
          `Not all dancers in payload. Missing number: ${
            dancers.length - positionData.length
          }`
        );
      }
      await Promise.all(
        positionData.map(async (data) => {
          const { dancerName } = data;
          const dancer = await ctx.prisma.dancer.findFirst({
            where: { name: dancerName },
          });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
        })
      );

      // updata positions
      await Promise.all(
        positionData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancerPositionData = data.positionData;
          const dancer: Dancer | null = await ctx.prisma.dancer.findFirst({
            where: { name: dancerName },
            include: { positionData: true },
          });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
          if (!dancer.positionData) {
            throw new Error(`Dancer ${dancerName} has no position data`);
          }
          await Promise.all(
            dancer.positionData.map(async (position) => {
              if (position.frameId === frameID) {
                await ctx.prisma.positionData.update({
                  where: {
                    dancerId_frameId: { dancerId: dancer.id, frameId: frameID },
                  },
                  data: {
                    x: dancerPositionData.x,
                    y: dancerPositionData.y,
                    z: dancerPositionData.z,
                  },
                });
              }
            })
          );
        })
      );

      // positionframe editing cancel
      await ctx.prisma.editingPositionFrame.update({
        where: { userId: ctx.userID },
        data: { frameId: null },
      });

      await updateRedisPosition(frameID);
      // subscription
      const payload: PositionMapPayload = {
        editBy: ctx.userID,
        frame: {
          createList: [],
          deleteList: [],
          updateList: [frameID],
        },
      };
      await publish(payload);
      return { frames: [{ id: frameID }] };
    }
  }
}
