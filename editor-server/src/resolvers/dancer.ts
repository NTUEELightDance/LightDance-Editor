import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";

import { Dancer, PositionData } from "../../prisma/generated/type-graphql";
import {
  AddDancerInput,
  editDancerInput,
  deleteDancerInput,
} from "./inputs/dancer";
import { Topic } from "./subscriptions/topic";
import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
import { generateID } from "../utility";
import { DancerResponse } from "./response/dancerResponse";
import { initRedisControl, initRedisPosition } from "../utility";
import { TContext } from "../types/global";

@Resolver((of) => Dancer)
export class DancerResolver {
  @Query((returns) => [Dancer])
  async dancer(@Ctx() ctx: TContext) {
    // const dancers = await ctx.db.Dancer.find()
    //   .populate("parts")
    //   .populate("positionData");
    // return dancers;
    const dancers = await ctx.prisma.dancer.findMany({});
    return dancers;
  }

  @Mutation((returns) => DancerResponse)
  async addDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") newDancerData: AddDancerInput,
    @Ctx() ctx: TContext
  ) {
    const existDancer = await ctx.prisma.dancer.findFirst({
    // const existDancer = await ctx.db.Dancer.findOne({
    //   name: newDancerData.name,
    // })
    //   .populate("positionData")
    //   .populate("parts");
      where: { name: newDancerData.name },
    });
    if (!existDancer) {
      const allPositionFramesIds = await ctx.prisma.positionFrame.findMany({
        select: { id: true }
      });
      const newDancer = await ctx.prisma.dancer.create({
        data: {
          name: newDancerData.name,
          positionData: {
            create: allPositionFramesIds.map(({ id: frameId }) => ({
              frameId,
              x: 0,
              y: 0,
              z: 0,
            })),
          }
        }
      });
      // const newDancer = new ctx.db.Dancer({
      //   name: newDancerData.name,
      //   parts: [],
      //   positionData: [],
      //   id: generateID(),
      // });

      // // for each position frame, add empty position data to the dancer
      // const allPositionFrames = await ctx.db.PositionFrame.find();
      // allPositionFrames.map(async (positionframe: any) => {
      //   const newPosition = new ctx.db.Position({
      //     frame: positionframe._id,
      //     x: 0,
      //     y: 0,
      //     z: 0,
      //   });
      //   newDancer.positionData.push(newPosition);
      //   await newPosition.save();
      // });
      await initRedisControl();
      await initRedisPosition();
      // const dancerData = await newDancer.save();
      const payload: DancerPayload = {
        mutation: dancerMutation.CREATED,
        editBy: Number(ctx.userID),
        dancerData: newDancer,
      };
      await publish(payload);

      // save dancer
      // return Object.assign(dancerData, { ok: true });
      return Object.assign({}, newDancer, { ok: true });
    }
    return Object.assign(existDancer, { ok: false, msg: "dancer exists" });
  }

  @Mutation((returns) => DancerResponse)
  async editDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") newDancerData: editDancerInput,
    @Ctx() ctx: TContext
  ) {
    const { id, name } = newDancerData;
    // const newDancer = await ctx.db.Dancer.findOneAndUpdate(
    //   { id },
    //   { name },
    //   { new: true }
    // ).populate("parts");
    const newDancer = await ctx.prisma.dancer.update({
      where: { id },
      data: { name },
      include: { parts: true },
    });
    if (newDancer) {
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: Number(ctx.userID),
        dancerData: newDancer,
      };
      await publish(payload);
      return Object.assign(newDancer, { ok: true });
    }
    return Object.assign(
      { name: "", parts: [], positionData: [], id: "" },
      { ok: false, msg: "dancer doesn't exist" }
    );
  }

  @Mutation((returns) => DancerResponse)
  async deleteDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") delDancerData: deleteDancerInput,
    @Ctx() ctx: TContext
  ) {
    const { id } = delDancerData;
    // const dancer = await ctx.db.Dancer.findOne({ id });
    const dancer = await ctx.prisma.dancer.findFirst({
      where: { id },
      include: { parts: {
        include: { controlData: true }
      } },
    });
    if (dancer) {
      await Promise.all(
        // dancer.parts.map(async (ref: string) => {
        //   const part = await ctx.db.Part.findOne({ _id: ref });
        //   await Promise.all(
        //     part.controlData.map(async (ref: string) => {
        //       await ctx.db.Control.deleteOne({ _id: ref });
        //     })
        //   );
        //   await ctx.db.Part.deleteOne({ _id: ref });
        // })
        dancer.parts.map(async ({ id: partId, controlData }) => {
          await Promise.all(
            controlData.map(async ({ frameId }) => {
              await ctx.prisma.controlData.delete({ where: {
                partId_frameId: { partId, frameId }
              }});
            })
          );
          await ctx.prisma.part.delete({ where: { id: partId }});
        })
      );
      // await ctx.db.Dancer.deleteOne({ id });
      await ctx.prisma.dancer.delete({ where: { id }});
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.DELETED,
        editBy: Number(ctx.userID),
      };
      await publish(payload);
      return Object.assign(dancer, { ok: true });
    }
    return Object.assign(
      { name: "", parts: [], positionData: [], id: "" },
      { ok: false, msg: "dancer doesn't exist" }
    );
  }
}
