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
import { PositionMap } from "./types/map";
import { Topic } from "./subscriptions/topic";
import { PositionMapPayload } from "./subscriptions/positionMap";
import { updateRedisPosition } from "../utility";
import { TContext } from "../types/global";
import { EditPositionMapInput, queryMapInput } from "./inputs/map";

@Resolver((of) => PositionMap)
export class PosMapResolver {
  @Query((returns) => PositionMap)
  async PosMap(
    @Ctx() ctx: TContext,
    @Arg("select", { nullable: true }) select: queryMapInput
  ) {
    if (!select) {
      const allFrameIds = await ctx.prisma.positionFrame.findMany({
        select: { id: true },
      });
      return { frameIds: allFrameIds.map((frame) => frame.id) };
    }
    return { frameIds: select.frameIds };
  }
}

@Resolver((of) => PosData)
export class EditPosMapResolver {
  @Mutation((returns) => PositionMap)
  async editPosMap(
    @PubSub(Topic.PositionMap) publish: Publisher<PositionMapPayload>,
    @Arg("input") input: EditPositionMapInput,
    @Ctx() ctx: TContext
  ) {
    const { positionData, frameId } = input;
    //check payload correctness
    const frameToEdit = await ctx.prisma.positionFrame.findUniqueOrThrow({
      where: { id: frameId },
    });

    const editing = await ctx.prisma.editingPositionFrame.findFirst({
      where: { frameId: frameToEdit.id },
    });
    if (editing && editing.userId && editing.userId !== ctx.userId)
      throw new Error(`The frame is now editing by ${editing.userId}.`);
    const dancers = await ctx.prisma.dancer.findMany({
      orderBy: { id: "asc" },
    });
    if (positionData.length !== dancers.length)
      throw new Error(
        `Not all dancers in payload. Missing number: ${
          dancers.length - positionData.length
        }`
      );
    //update position data
    await Promise.all(
      positionData.map(async (coor, ind) => {
        const dancer = dancers[ind];
        await ctx.prisma.positionData.update({
          where: {
            dancerId_frameId: {
              dancerId: dancer.id,
              frameId: frameToEdit.id,
            },
          },
          data: {
            x: coor[0],
            y: coor[1],
            z: coor[2],
          },
        });
      })
    );
    await ctx.prisma.editingPositionFrame.update({
      where: { userId: ctx.userId },
      data: { frameId: null },
    });

    await updateRedisPosition(frameToEdit.id);
    // subscription
    const payload: PositionMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [frameToEdit.id],
      },
    };
    await publish(payload);
    const frameIds = await ctx.prisma.positionFrame.findMany({
      select: { id: true },
    });
    return { frameIds: frameIds.map((frame) => frame.id) };
  }
}
