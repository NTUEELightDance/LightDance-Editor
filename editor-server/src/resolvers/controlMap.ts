import {
  Resolver,
  Ctx,
  Query,
  Mutation,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";
import { Prisma } from "@prisma/client";
import { ControlMap } from "./types/map";
import { ControlData } from "../../prisma/generated/type-graphql";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { updateRedisControl } from "../utility";
import { TContext } from "../types/global";
import { EditControlMapInput, queryMapInput } from "./inputs/map";

@Resolver((of) => ControlMap)
export class ControlMapResolver {
  @Query((returns) => ControlMap)
  async ControlMap(
    @Ctx() ctx: TContext,
    @Arg("select", { nullable: true }) select: queryMapInput
  ) {
    if (!select) {
      const allFrameIds = await ctx.prisma.controlFrame.findMany({
        select: { id: true },
      });
      return { frameIds: allFrameIds.map((frame) => frame.id) };
    }
    return { frameIds: select.frameIds };
  }
}

@Resolver((of) => ControlData)
export class EditControlMapResolver {
  @Mutation((returns) => ControlMap)
  async editControlMap(
    @PubSub(Topic.ControlMap) publish: Publisher<ControlMapPayload>,
    @Arg("input") input: EditControlMapInput,
    @Ctx() ctx: TContext
  ) {
    const { fade, controlData, frameId } = input;
    // check payload
    const frameToEdit = await ctx.prisma.controlFrame.findUniqueOrThrow({
      where: { id: frameId },
    });

    const dancers = await ctx.prisma.dancer.findMany({
      include: {
        parts: {
          include: { controlData: true },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
    const editing = await ctx.prisma.editingControlFrame.findFirst({
      where: { frameId: frameToEdit.id },
    });
    if (editing && editing.userId && editing.userId !== ctx.userId)
      throw new Error(`The frame is now editing by ${editing.userId}.`);
    if (controlData.length !== dancers.length) {
      throw new Error(
        `Not all dancers in payload. Missing number: ${
          dancers.length - controlData.length
        }`
      );
    }

    await Promise.all(
      controlData.map(async (datas, ind) => {
        const dancer = dancers[ind];
        const parts = dancer.parts;
        await Promise.all(
          datas.map(async (data, index) => {
            const part = parts[index];
            const type = part.type;
            const partControl = part.controlData.find(
              ({ frameId }) => frameToEdit.id === frameId
            );
            if (!partControl)
              throw new Error(
                `part id ${part.id} has no controlData in frame id ${frameToEdit.id}`
              );
            const value = partControl.value as Prisma.JsonObject;
            value.alpha = Number(data[1]);
            if (type === "FIBER") value.color = data[0];
            else value.src = data[0];
            await ctx.prisma.controlData.update({
              where: {
                partId_frameId: {
                  partId: part.id,
                  frameId: frameToEdit.id,
                },
              },
              data: {
                value,
              },
            });
          })
        );
      })
    );
    if (fade !== frameToEdit.fade) {
      await ctx.prisma.controlFrame.update({
        where: { id: frameToEdit.id },
        data: { fade },
      });
    }
    await ctx.prisma.editingControlFrame.update({
      where: { userId: ctx.userId },
      data: { frameId: null },
    });

    await updateRedisControl(frameToEdit.id);

    const payload: ControlMapPayload = {
      editBy: ctx.userId,
      frame: {
        createList: [],
        deleteList: [],
        updateList: [frameToEdit.id],
      },
    };
    await publish(payload);
    const frameIds = await ctx.prisma.controlFrame.findMany({
      select: { id: true },
    });

    return { frameIds: frameIds.map((frame) => frame.id) };
  }
}
