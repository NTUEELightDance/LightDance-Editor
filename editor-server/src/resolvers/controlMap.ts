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
import { ControlData } from "../../prisma/generated/type-graphql";
import { ControlDataInput, EditControlInput } from "./inputs/control";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { updateRedisControl, generateID } from "../utility";
import {
  ControlRecordPayload,
  ControlRecordMutation,
} from "./subscriptions/controlRecord";
import { IControlFrame, IDancer, IPart, TContext } from "../types/global";
import { JsonObjectExpression } from "typescript";

@Resolver((of) => Map)
export class ControlMapResolver {
  @Query((returns) => Map)
  async ControlMap(@Ctx() ctx: TContext) {
    // const frames:IControlFrame[] = await ctx.db.ControlFrame.find();
    const frames = await ctx.prisma.controlFrame.findMany();
    const id = frames.map((frame) => {
      // return { id: frame.id, _id: frame._id };
      return { id: frame.id };
    });
    return { frames: id };
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
    // find control frame
    // const controlFrame = await ctx.db.ControlFrame.findOne({
    //   start: startTime,
    // });
    const controlFrame = await ctx.prisma.controlFrame.findFirst({
      where: { start: startTime },
    });

    // check payload
    // const dancers = await ctx.db.Dancer.find();
    const dancers = await ctx.prisma.dancer.findMany();
    if (controlData.length !== dancers.length) {
      throw new Error(
        `Not all dancers in payload. Missing number: ${
          dancers.length - controlData.length
        }`
      );
    }
    await Promise.all(
      controlData.map(async (data) => {
        const dancerName = data.dancerName;
        const dancerControlData = data.controlData;
        // const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
        const dancer = await ctx.prisma.dancer.findFirst({
          where: { name: dancerName },
        });
        if (!dancer) {
          throw new Error(`Dancer ${dancerName} not found`);
        }
        const parts = await ctx.prisma.part.findMany({
          where: { dancer: { name: dancerName } },
        });
        // if (dancer.parts.length !== dancerControlData.length) {
        if (parts.length !== dancerControlData.length) {
          throw new Error(
            `Not all parts in payload. Missing number: ${
              // dancer.parts.length - dancerControlData.length
              parts.length - dancerControlData.length
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
          })
        );
      })
    );

    // if control frame already exists -> edit
    if (controlFrame) {
      // const { editing, _id, id: frameID } = controlFrame;
      const { id: frameID } = controlFrame;
      const editing = await ctx.prisma.editingControlFrame.findFirst({
        where: { frameId: frameID },
      });
      if (editing?.userId !== ctx.userID) {
        throw new Error(`The frame is now editing by ${editing}.`);
      }
      await Promise.all(
        controlData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancerControlData = data.controlData;
          // const dancer: IDancer = await ctx.db.Dancer.findOne({
          //   name: dancerName,
          // }).populate({
          //   path: "parts",
          //   populate: {
          //     path: "controlData",
          //     match: { frame: _id },
          //   },
          // });
          const dancer = await ctx.prisma.dancer.findFirst({
            where: { name: dancerName },
          });
          await Promise.all(
            dancerControlData.map(async (data) => {
              const { partName, ELValue, color, src, alpha } = data;
              // const wanted: IPart = dancer.parts.find(
              //   (part: IPart) => part.name === partName
              // );
              const wanted = await ctx.prisma.part.findFirst({
                where: { dancerId: dancer?.id, name: partName },
                include: { controlData: true },
              });
              if (!wanted) throw new Error(`part ${partName} not found`);
              const type = wanted.type;
              // const {value, _id} = wanted.controlData[0];
              let { value } = wanted.controlData[0];
              if(value===null || typeof value !== "object") throw new Error("value not found");
              value= {...value, alpha};
              if (type === "FIBER") {
                if (color && typeof value==="object") {
                  // value.color = color;
                  value = {...value, color};
                }
                // if (alpha || alpha === 0) {
                //   // value.alpha = alpha;
                // }
              // } else if (type === "EL") {
              //   if (ELValue || ELValue === 0) {
              //     value.value = ELValue;
              //   }
              } else if (type === "LED") {
                if ((src || src === "")&& typeof value==="object") {
                  // value.src = src;
                  value ={...value, src};
                }
                // if (alpha || alpha === 0) {
                //   value.alpha = alpha;
                // }
              }
              // await ctx.db.Control.updateOne({ _id }, { value });
              await ctx.prisma.controlData.update({
                where: { partId_frameId: { partId: wanted.id, frameId: frameID}},
                data: {
                  value: value as Prisma.JsonObject
                }
              });
            })
          );
        })
      );
      await ctx.db.ControlFrame.updateOne(
        { start: startTime },
        { editing: null, fade }
      );
      await updateRedisControl(frameID);
      const payload: ControlMapPayload = {
        editBy: ctx.userID,
        frame: {
          createList: [],
          deleteList: [],
          updateList: [frameID],
        },
      };
      await publish(payload);
      return { frame: { _id, id: frameID } };
    }

    // control frame not found -> add
    else {
      // add control frame
      const newControlFrame = await new ctx.db.ControlFrame({
        start: startTime,
        fade: fade,
        id: generateID(),
      }).save();

      await Promise.all(
        controlData.map(async (dancerParts) => {
          // data for one of the dancers
          const dancerName = dancerParts.dancerName;
          const dancerControlData = dancerParts.controlData;
          await Promise.all(
            dancerControlData.map(async (partData) => {
              const dancer: IDancer = await ctx.db.Dancer.findOne({
                name: dancerName,
              }).populate({
                path: "parts",
                match: { name: partData.partName },
              });
              // for the part of a certain dancer, create a new control of the part with designated value
              const value = await examineType(partData, ctx);
              const newControl = new ctx.db.Control({
                frame: newControlFrame,
                value,
                id: generateID(),
              });
              await ctx.db.Part.findOneAndUpdate(
                { id: dancer.parts[0].id },
                {
                  $push: {
                    controlData: newControl,
                  },
                }
              );
              await newControl.save();
            })
          );
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
      await publish(mapPayload);
      const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find().sort({
        start: 1,
      });
      let index = -1;
      allControlFrames.map((frame, idx: number) => {
        if (frame.id === newControlFrame.id) {
          index = idx;
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
      return { frame: { _id: newControlFrame._id, id: newControlFrame.id } };
    }
  }
}

async function examineType(partData: ControlDataInput, ctx: TContext) {
  const { partName, ELValue, color, src, alpha } = partData;
  const { type } = await ctx.db.Part.findOne({ name: partName });
  if (type === "FIBER") {
    return {
      color,
      alpha,
    };
  } else if (type === "EL") {
    return {
      value: ELValue,
    };
  } else if (type === "LED") {
    return { src, alpha };
  }
}
