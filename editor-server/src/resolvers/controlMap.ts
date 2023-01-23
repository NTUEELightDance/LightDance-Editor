import {
  Resolver,
  Ctx,
  Query,
  Mutation,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";

import { Map } from "./types/map";
import { ControlData } from "./types/controlData";
import { ControlDataInput, EditControlInput } from "./inputs/control";
import { Topic } from "./subscriptions/topic";
import { ControlMapPayload } from "./subscriptions/controlMap";
import { updateRedisControl, generateID } from "../utility";
import {
  ControlRecordPayload,
  ControlRecordMutation,
} from "./subscriptions/controlRecord";
import { IControlFrame, IDancer, IPart, TContext } from "../types/global";

@Resolver((of) => Map)
export class ControlMapResolver {
  @Query((returns) => Map)
  async ControlMap(@Ctx() ctx: TContext) {
    const frames: IControlFrame[] = await ctx.db.ControlFrame.find();
    const id = frames.map((frame) => {
      return { id: frame.id, _id: frame._id };
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
    const controlFrame = await ctx.db.ControlFrame.findOne({
      start: startTime,
    });

    // check payload
    const dancers = await ctx.db.Dancer.find();
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
        const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
        if (!dancer) {
          throw new Error(`Dancer ${dancerName} not found`);
        }
        if (dancer.parts.length !== dancerControlData.length) {
          throw new Error(
            `Not all parts in payload. Missing number: ${
              dancer.parts.length - dancerControlData.length
            }`
          );
        }
        await Promise.all(
          dancerControlData.map(async (partData) => {
            const part = await ctx.db.Part.findOne({ name: partData.partName });
            if (!part) {
              throw new Error(`Part ${partData.partName} not found`);
            }
          })
        );
      })
    );

    // if control frame already exists -> edit
    if (controlFrame) {
      const { editing, _id, id: frameID } = controlFrame;
      if (editing !== ctx.username) {
        throw new Error(`The frame is now editing by ${editing}.`);
      }
      await Promise.all(
        controlData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancerControlData = data.controlData;
          const dancer: IDancer = await ctx.db.Dancer.findOne({
            name: dancerName,
          }).populate({
            path: "parts",
            populate: {
              path: "controlData",
              match: { frame: _id },
            },
          });
          await Promise.all(
            dancerControlData.map(async (data) => {
              const { partName, ELValue, color, src, alpha } = data;
              const wanted: IPart = dancer.parts.find(
                (part: IPart) => part.name === partName
              );
              if (!wanted) throw new Error(`part ${partName} not found`);
              const type = wanted.type;
              const { value, _id } = wanted.controlData[0];
              if (type === "FIBER") {
                if (color) {
                  value.color = color;
                }
                if (alpha || alpha === 0) {
                  value.alpha = alpha;
                }
              } else if (type === "EL") {
                if (ELValue || ELValue === 0) {
                  value.value = ELValue;
                }
              } else if (type === "LED") {
                if (src || src === "") {
                  value.src = src;
                }
                if (alpha || alpha === 0) {
                  value.alpha = alpha;
                }
              }
              await ctx.db.Control.updateOne({ _id }, { value });
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
        editBy: ctx.username,
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
        editBy: ctx.username,
        frame: {
          createList: [newControlFrame.id],
          deleteList: [],
          updateList: [],
        },
      };
      await publish(mapPayload);
      const allControlFrames: IControlFrame[] =
        await ctx.db.ControlFrame.find().sort({
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
        editBy: ctx.username,
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
