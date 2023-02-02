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
import { Map } from "./types/map";
// import { ControlData } from "./types/controlData";
import { ControlData, EditingControlFrame, Part, PartMinAggregate } from "../../prisma/generated/type-graphql";
import { ControlDataInput, EditControlInput } from "./inputs/control";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { updateRedisControl, generateID } from "../utility";
import {
  ControlRecordPayload,
  ControlRecordMutation,
} from "./subscriptions/controlRecord";
import { TContext } from "../types/global";

@Resolver((of) => Map)
export class ControlMapResolver {
  @Query((returns) => Map)
  async ControlMap(@Ctx() ctx: TContext) {
    // const frames:IControlFrame[] = await ctx.db.ControlFrame.find();
    const frames = await ctx.prisma.controlFrame.findMany({
      select: { id:true }
    });
    // const id = frames.map((frame) => {
      // return { id: frame.id, _id: frame._id };
    // });
    // return { frames: id };
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
    // const dancers = await ctx.db.Dancer.find();
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

    const targetParts: { part: Part, corresDancerName: string}[] = [];

    await Promise.all(
      controlData.map(async (data) => {
        const { dancerName, controlData: dancerControlData} = data;
        // const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
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
            // const part = await ctx.db.Part.findOne({ name: partData.partName });
            const part = await ctx.prisma.part.findFirst({
              where: { name: partData.partName },
            });
            if (!part) {
              throw new Error(`Part ${partData.partName} not found`);
            }
            targetParts.push({ part, corresDancerName: dancerName });
          })
        );
      })
    );

    // find control frame
    const controlFrame = await ctx.prisma.controlFrame.findFirst({
      where: { start: startTime },
    });
    if(!controlFrame) throw new Error(`Control frame not found`);
    const frameToEdit = await ctx.prisma.editingControlFrame.findFirst({
      where: { frameId: controlFrame.id },
    });
    if (
      frameToEdit &&
      frameToEdit.userId &&
      frameToEdit.userId !== ctx.userID
      ) {
        throw new Error(`The frame is now editing by ${frameToEdit.userId}.`);
      }
    if(!frameToEdit) throw new Error(`Control frame not found`);
    if(!frameToEdit.frameId) throw new Error(`Control frame has no frameId`);
    // if control frame already exists -> edit
    if (frameToEdit) {
      // const { editing, _id, id: frameID } = controlFrame;
      const { frameId: frameID } = frameToEdit;
      await Promise.all(
        controlData.map(async (data)=>{
          const { dancerName, controlData: dancerControlData} = data;
          await Promise.all(
            dancerControlData.map(async (data)=>{
              const { partName, color, src, alpha } = data;
              const wanted = targetParts.find(
                ({ corresDancerName })=> dancerName===corresDancerName
              )?.part;
              if (!wanted || !wanted.controlData) throw new Error(`part ${partName} or controlData ${wanted?.controlData} not found`);
              const type = wanted.type;
              const value = wanted.controlData[0].value as Prisma.JsonObject;
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
      // const newControlFrame = await new ctx.db.ControlFrame({
      //   start: startTime,
      //   fade: fade,
      //   id: generateID(),
      // }).save();
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
              // const dancer: IDancer = await ctx.db.Dancer.findOne({
              //   name: dancerName,
              // }).populate({
              //   path: "parts",
              //   match: { name: partData.partName },
              // });
              // for the part of a certain dancer, create a new control of the part with designated value
              const value = await examineType(partData, ctx);
              const dancer = await ctx.prisma.dancer.findFirst({
                where: { name: dancerName }
              });
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
              // const newControl = new ctx.db.Control({
              //   frame: newControlFrame,
              //   value,
              //   id: generateID(),
              // });
              // await ctx.db.Part.findOneAndUpdate(
              //   { id: dancer.parts[0].id },
              //   {
              //     $push: {
              //       controlData: newControl,
              //     },
              //   }
              // );
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
              // await newControl.save();
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
      // const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find().sort({
      //   start: 1,
      // });
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
  // const { type } = await ctx.db.Part.findOne({ name: partName });
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
  } else if (type === "EL") {
    return {
      value: ELValue,
    };
  }else {
    return { color, alpha, src, value:ELValue};
  }
}
