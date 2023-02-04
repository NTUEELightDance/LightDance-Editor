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
import { DancerResponse } from "./response/dancerResponse";
import { initRedisControl, initRedisPosition } from "../utility";
import { TContext } from "../types/global";

@Resolver((of) => Dancer)
export class DancerResolver {
  @Query((returns) => [Dancer])
  async dancers(@Ctx() ctx: TContext) {
    const dancers = await ctx.prisma.dancer.findMany({
      include: { parts: true, positionData: true }
    });
    return dancers;
  }

  @Query((returns) => Dancer)
  async dancer(
    @Arg("dancerName") dancerName: string,
    @Ctx() ctx: TContext
  ) {
    const dancer = await ctx.prisma.dancer.findFirst({
      where: { name: dancerName },
      include: { parts: true, positionData: true }
    });
    if(!dancer) throw new Error("dancer not found");
    return dancer;
  }

  @Mutation((returns) => DancerResponse)
  async addDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") newDancerData: AddDancerInput,
    @Ctx() ctx: TContext
  ) {
    const existDancer = await ctx.prisma.dancer.findFirst({
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
      await initRedisControl();
      await initRedisPosition();
      const payload: DancerPayload = {
        mutation: dancerMutation.CREATED,
        editBy: Number(ctx.userID),
        dancerData: newDancer,
      };
      await publish(payload);

      // save dancer
      return {dancerData:newDancer,  ok: true, msg: "dancer created" };
    }
    return {dancerData: existDancer, ok: false, msg: "dancer exists" };
  }

  @Mutation((returns) => DancerResponse)
  async editDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") newDancerData: editDancerInput,
    @Ctx() ctx: TContext
  ) {
    const { id, name } = newDancerData;
    const newDancer = await ctx.prisma.dancer.update({
      where: { id },
      data: { name },
    });
    if (newDancer) {
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: Number(ctx.userID),
        dancerData: newDancer,
      };
      await publish(payload);
      return {dancerData: newDancer, ok: true, msg: "dancer updated" };
    }
    return { ok: false, msg: "dancer not found" };
  }

  @Mutation((returns) => DancerResponse)
  async deleteDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") delDancerData: deleteDancerInput,
    @Ctx() ctx: TContext
  ) {
    const { id } = delDancerData;
    const dancer = await ctx.prisma.dancer.findFirst({
      where: { id },
      include: { parts: true, positionData: true }
    });
    if(!dancer) return { ok: false, msg: "dancer not found" };
    await ctx.prisma.dancer.delete({ where: { id }});
    await initRedisControl();
    await initRedisPosition();
    const payload: DancerPayload = {
      mutation: dancerMutation.DELETED,
      editBy: Number(ctx.userID),
    };
    await publish(payload);
    return { ok: true, msg: "dancer deleted" };
  }
}
