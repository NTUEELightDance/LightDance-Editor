import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";

import { Dancer } from "../../prisma/generated/type-graphql";
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
    // const existDancer = await ctx.db.Dancer.findOne({
    //   name: newDancerData.name,
    // })
    //   .populate("positionData")
    //   .populate("parts");
    const existDancer = await ctx.prisma.dancer.findFirst({
      where: { name: newDancerData.name },
    });
    if (!existDancer) {
      // const newDancer = new ctx.db.Dancer({
      //   name: newDancerData.name,
      //   parts: [],
      //   positionData: [],
      //   id: generateID(),
      // });
      const allPositionFrames = await ctx.prisma.positionFrame.findMany();
      const newDancer = await ctx.prisma.dancer.create({
        data: {
          name: newDancerData.name,
          positionData: {
            create: allPositionFrames.map((positionframe) => ({
              frameId: positionframe.id,
              x: 0,
              y: 0,
              z: 0,
            })),
          }
        }
      });

      // for each position frame, add empty position data to the dancer
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
      const dancerData = await ctx.prisma.dancer.findFirst({
        where: { id: newDancer.id },
      });
      const payload: DancerPayload = {
        mutation: dancerMutation.CREATED,
        editBy: ctx.userID,
        dancerData,
      };
      await publish(payload);

      // save dancer
      // return Object.assign(dancerData, { ok: true });
      return Object.assign({}, dancerData, { ok: true });
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
    const newDancer = await ctx.db.Dancer.findOneAndUpdate(
      { id },
      { name },
      { new: true }
    ).populate("parts");
    if (newDancer) {
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: ctx.userID,
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
    @Arg("dancer") newDancerData: deleteDancerInput,
    @Ctx() ctx: TContext
  ) {
    const { id } = newDancerData;
    const dancer = await ctx.db.Dancer.findOne({ id });
    if (dancer) {
      await Promise.all(
        dancer.parts.map(async (ref: string) => {
          const part = await ctx.db.Part.findOne({ _id: ref });
          await Promise.all(
            part.controlData.map(async (ref: string) => {
              await ctx.db.Control.deleteOne({ _id: ref });
            })
          );
          await ctx.db.Part.deleteOne({ _id: ref });
        })
      );
      await ctx.db.Dancer.deleteOne({ id });
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.DELETED,
        editBy: ctx.userID,
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
