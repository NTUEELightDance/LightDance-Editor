import {
  Resolver,
  Query,
  Mutation,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  PubSub,
  Publisher,
} from "type-graphql";
import { Part } from "./types/part";
import { AddPartInput, EditPartInput, DeletePartInput } from "./inputs/part";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
import { PartResponse } from "./response/partResponse";
import { generateID, initRedisControl, initRedisPosition } from "../utility";
import Dancer from "../models/Dancer";

@Resolver((of) => Part)
export class PartResolver {
  @Mutation((returns) => PartResponse)
  async addPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: AddPartInput,
    @Ctx() ctx: any
  ) {
    const existDancer = await ctx.db.Dancer.findOne({
      name: newPartData.dancerName,
    }).populate("parts");
    if (existDancer) {
      const duplicatePartName = existDancer.parts.filter(
        (part: Part) => part.name === newPartData.name
      );
      if (duplicatePartName.length === 0) {
        const newPart = new ctx.db.Part({
          name: newPartData.name,
          type: newPartData.type,
          value: ControlDefault[newPartData.type],
          id: generateID(),
        });
        const allControlFrames = await ctx.db.ControlFrame.find();
        allControlFrames.map(async (controlframe: any) => {
          const newControl = new ctx.db.Control({
            frame: controlframe._id,
            value: ControlDefault[newPartData.type],
          });
          newPart.controlData.push(newControl._id);
          await newControl.save();
        });

        // for each position frame, add empty position data to the dancer
        const dancer = await ctx.db.Dancer.update(
          { name: newPartData.dancerName },
          { $push: { parts: newPart._id } }
        );
        const result = await newPart.save();
        const dancerData = await ctx.db.Dancer.findOne({
          name: newPartData.dancerName,
        }).populate("parts");
        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: ctx.userID,
          dancerData,
        };
        await publish(payload);

        return Object.assign(result, { ok: true });
      }
      return {
        name: "",
        type: null,
        id: "",
        ok: false,
        msg: "duplicate part",
        controlData: [],
      };
    }
    return {
      name: "",
      type: null,
      id: "",
      ok: false,
      msg: "no dancer",
      controlData: [],
    };
  }

  @Mutation((returns) => PartResponse)
  async editPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: EditPartInput,
    @Ctx() ctx: any
  ) {
    const { id, name, type, dancerName } = newPartData;
    const edit_part = await ctx.db.Part.findOne({ id });
    if (edit_part) {
      if (edit_part.type !== type) {
        edit_part.controlData.map(async (id: string) => {
          const data = await ctx.db.Control.findOneAndUpdate(
            { _id: id },
            { value: ControlDefault[type] }
          );
        });
      }
      const result = await ctx.db.Part.findOneAndUpdate(
        { id },
        { name, type },
        { new: true }
      );
      const dancerData = await ctx.db.Dancer.findOne({
        name: dancerName,
      }).populate("parts");
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: ctx.userID,
        dancerData,
      };
      await publish(payload);
      return Object.assign(result, { ok: true });
    }
    return {
      name: "",
      type: null,
      id: "",
      ok: false,
      msg: "no part found",
      controlData: [],
    };
  }

  @Mutation((returns) => PartResponse)
  async deletePart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: DeletePartInput,
    @Ctx() ctx: any
  ) {
    const { id, dancerName } = newPartData;
    const part = await ctx.db.Part.findOne({ id });
    if (part) {
      const part_id = part._id;
      await Promise.all(
        part.controlData.map(async (ref: string) => {
          await ctx.db.Control.deleteOne({ _id: ref });
        })
      );
      await ctx.db.Part.deleteOne({ id });
      const dancer = ctx.db.Dancer.findOne({ name: dancerName });
      if (dancer) {
        await ctx.db.Dancer.updateOne(
          { name: dancerName },
          { $pullAll: { parts: [{ _id: part_id }] } }
        );
      }
      const dancerData = await ctx.db.Dancer.findOne({
        name: dancerName,
      }).populate("parts");
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: ctx.userID,
        dancerData,
      };
      await publish(payload);
      return Object.assign(part, { ok: true });
    }
    return {
      name: "",
      type: null,
      id: "",
      ok: false,
      msg: "no part found",
      controlData: [],
    };
  }

  @FieldResolver()
  async controlData(@Root() part: any, @Ctx() ctx: any) {
    const result = await Promise.all(
      part.controlData.map(async (ref: string) => {
        const data = await ctx.db.Control.findOne({ _id: ref }).populate(
          "frame"
        );
        return data;
      })
    ).then((result) => {
      return result;
    });
    // return data

    return result;
  }
}
