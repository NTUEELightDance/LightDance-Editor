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
import { ControlData,  Part } from "../../prisma/generated/type-graphql";
import { ControlDataInput, EditControlInput } from "./inputs/control";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { updateRedisControl } from "../utility";
import {
  ControlRecordPayload,
  ControlRecordMutation,
} from "./subscriptions/controlRecord";
import { TContext } from "../types/global";

@Resolver((of) => ControlMap)
export class ControlMapResolver {
  @Query((returns) => ControlMap)
  async ControlMap(@Ctx() ctx: TContext) {
    const frames = await ctx.prisma.controlFrame.findMany({
      select: { id:true }
    });
    return { frames };
  }
}

@Resolver((of) => ControlData)
export class EditControlMapResolver {
  @Mutation((returns) => ControlData)
  async editControlMap(
    @PubSub(Topic.ControlRecord)
      publishControlRecord: Publisher<ControlRecordPayload>,
    @PubSub(Topic.ControlMap) publish: Publisher<ControlMapPayload>,
    @Arg("controlData", (type) => [EditControlInput])
      controlData: EditControlInput[],
    @Arg("fade", { nullable: true, defaultValue: false }) fade: boolean,
    @Arg("start") startTime: number,
    @Ctx() ctx: TContext
  ) {
    // check payload
    const dancers = await ctx.prisma.dancer.findMany({
      include: {
        parts: {
          include: { controlData: true }
        }
      }
    });
    if (controlData.length !== dancers.length) {
      throw new Error(
        `Not all dancers in payload. Missing number: ${
          dancers.length - controlData.length
        }`
      );
    }
    await Promise.all(
      controlData.map(async (data) => {
        const { dancerName, controlData: dancerControlData} = data;
        const dancer = dancers.find(
          ({ name })=> dancerName===name
        );
        if (!dancer) throw new Error(`Dancer ${dancerName} not found`);
        if (dancer.parts.length !== dancerControlData.length) {
          throw new Error(
            `Not all parts in payload. Missing number: ${
              dancer.parts.length - dancerControlData.length
            }`
          );
        }
        await Promise.all(
          dancerControlData.map(async (partData) => {
            const part = await ctx.prisma.part.findFirst({
              where: { name: partData.partName },
              include: { controlData: true }
            });
            if (!part) {
              throw new Error(`Part ${partData.partName} not found`);
            }
            if (!part.controlData) throw new Error(`part controlData ${part.controlData} not found`);
          })
        );
      })
    );

    // find control frame
    const controlFrame = await ctx.prisma.controlFrame.findFirst({
      where: { start: startTime },
    });
    if(!controlFrame) throw new Error("Control frame not found");
    const frameToEdit = await ctx.prisma.editingControlFrame.findFirst({
      where: { frameId: controlFrame.id },
    });
    if(!frameToEdit) throw new Error("Control frame not found");
    if (frameToEdit.userId !== ctx.userID) throw new Error(`The frame is now editing by ${frameToEdit.userId}.`);
    if(!frameToEdit.frameId) throw new Error("Control frame has no frameId");
    // if control frame already exists -> edit
    if (frameToEdit) {
      const { frameId: frameID } = frameToEdit;
      await Promise.all(
        controlData.map(async (data)=>{
          const { dancerName, controlData: dancerControlData} = data;
          const wantedDancer = dancers.find(
            ({ name })=> dancerName===name
          );
          await Promise.all(
            dancerControlData.map(async (data)=>{
              const { partName, color, src, alpha } = data;
              const wanted = await ctx.prisma.part.findFirst({
                where: { dancerId: wantedDancer?.id, name: partName },
                include: { controlData: true }
              });
              if (!wanted) throw new Error(`Part ${partName} not found`);
              if (!wanted.controlData) throw new Error(`wanted part controlData ${wanted.controlData} not found`);
              const type = wanted?.type;
              const value = wanted?.controlData[0].value as Prisma.JsonObject;
              value.alpha=alpha;
              if (type === "FIBER") {
                if (color) {
                  value.color=color;
                }
              } else if (type === "LED") {
                if ((src || src === "")) {
                  value.src = src;
                }
              }
              await ctx.prisma.controlData.update({
                where: { partId_frameId: { partId: wanted.id, frameId: frameID}},
                data: {
                  value
                }
              });
            })
          );
        })
      );
      await ctx.prisma.editingControlFrame.update({
        where: { userId: ctx.userID },
        data: { frameId: null }
      });
      await updateRedisControl(frameID);
      const payload: ControlMapPayload = {
        editBy: Number(ctx.userID),
        frame: {
          createList: [],
          deleteList: [],
          updateList: [frameID],
        },
      };
      await publish(payload);
      return { frame: { id: frameID } };
    }

    // control frame not found -> add
    else {
      // add control frame
      const newControlFrame = await ctx.prisma.controlFrame.create({
        data: {
          start: startTime,
          fade,
        }
      });

      await Promise.all(
        controlData.map(async (dancerParts) => {
          // data for one of the dancers
          const { dancerName, controlData: dancerControlData } = dancerParts;
          await Promise.all(
            dancerControlData.map(async (partData) => {
              // for the part of a certain dancer, create a new control of the part with designated value
              const value = await examineType(partData, ctx);
              const dancer = dancers.find(
                ({ name })=> dancerName===name
              );
              if(!dancer) throw new Error("dancer name not found");
              const part = await ctx.prisma.part.findFirst({
                where: { name: partData.partName, dancerId: dancer?.id },
              });
              if(!part) throw new Error(`part ${partData.partName} not found`);
              await ctx.prisma.controlData.create({
                data:{
                  partId: part.id,
                  frameId: newControlFrame.id,
                  value
                }
              });
              await ctx.prisma.part.update({
                where: { id: part.id },
                data: {
                  controlData: {
                    connect: { partId_frameId: {
                      partId: part.id,
                      frameId: newControlFrame.id
                    }}
                  }
                }
              });
            })
          );
        })
      );

      await updateRedisControl(newControlFrame.id);
      const mapPayload: ControlMapPayload = {
        editBy: Number(ctx.userID),
        frame: {
          createList: [newControlFrame.id],
          deleteList: [],
          updateList: [],
        },
      };
      await publish(mapPayload);
      const allControlFrames = await ctx.prisma.controlFrame.findMany({
        orderBy: { start: "asc" }
      });
      let index = -1;
      allControlFrames.map((frame, idx: number) => {
        if (frame.id === newControlFrame.id) {
          index = idx;
        }
      });
      const recordPayload: ControlRecordPayload = {
        mutation: ControlRecordMutation.CREATED,
        editBy: Number(ctx.userID),
        addID: [newControlFrame.id],
        updateID: [],
        deleteID: [],
        index,
      };
      await publishControlRecord(recordPayload);
      return { frame: { id: newControlFrame.id } };
    }
  }
}

async function examineType(partData: ControlDataInput, ctx: TContext) {
  const { partName, ELValue, color, src, alpha } = partData;
  const part = await ctx.prisma.part.findFirst({
    where: { name: partName },
  });
  if(!part) throw new Error(`part ${partName} not found`);
  const type = part.type;
  if (type === "FIBER") {
    return {
      color,
      alpha,
    };
  } else if(type === "LED") {
    return { src, alpha };
  }else {
    return { color, alpha, src, value:ELValue};
  }
}
