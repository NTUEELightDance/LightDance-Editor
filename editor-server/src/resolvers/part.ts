import {
  Resolver,
  Mutation,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  PubSub,
  Publisher,
} from "type-graphql";
import { AddPartInput, EditPartInput, DeletePartInput } from "./inputs/part";
import { ControlDefault, ControlType } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
import { PartResponse } from "./response/partResponse";
import { initRedisControl, initRedisPosition } from "../utility";
import { TContext } from "../types/global";
import { ControlData, ControlFrame, Part } from "../../prisma/generated/type-graphql";

@Resolver((of) => Part)
export class PartResolver {
  @Mutation((returns) => PartResponse)
  async addPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: AddPartInput,
    @Ctx() ctx: TContext
  ) {
    if(!Object.values(ControlType).includes(newPartData.type)) throw new Error("type is invalid");
    const existDancer = await ctx.prisma.dancer.findFirst({
      where: { name: newPartData.dancerName },
      include: { parts: true },
    });

    if (existDancer) {
      const duplicatePartName = existDancer.parts.find(
        (part: Part) => part.name === newPartData.name
      );
      if (!duplicatePartName) {
        const newPart = await ctx.prisma.part.create({
          data: {
            dancerId: existDancer.id,
            name: newPartData.name,
            type: newPartData.type,
          },
        });

        const allControlFrames: ControlFrame[] = await ctx.prisma.controlFrame.findMany();
        // for each position frame, add empty position data to the dancer
        await ctx.prisma.controlData.createMany({
          data: allControlFrames.map(controlFrame=>(
            {
              partId: newPart.id,
              frameId: controlFrame.id,
              value: ControlDefault[newPartData.type],
            }
          ))
        });
        const dancerData = await ctx.prisma.dancer.update({
          where: { id: existDancer.id },
          data: {
            parts: {
              connect: {
                id: newPart.id,
              },
            },
          },
        });
        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.CREATED,
          editBy: ctx.userID,
          dancerData
        };
        await publish(payload);

        return {partData: newPart, ok: true, msg:"successfully add part"};
      }
      return {
        ok: false,
        msg: "duplicate part",
      };
    }
    return {
      ok: false,
      msg: "no dancer",
    };
  }

  @Mutation((returns) => PartResponse)
  async editPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: EditPartInput,
    @Ctx() ctx: TContext
  ) {
    const { id, name, type } = newPartData;
    if(!Object.values(ControlType).includes(type)) throw new Error("type is invalid");
    const edit_part = await ctx.prisma.part.findFirst({
      where: { id },
      include: { controlData: true },
    });
    if (edit_part) {
      if (edit_part.type !== type) {
        await ctx.prisma.controlData.updateMany({
          where: { partId: id },
          data: { value: ControlDefault[type] },
        });
      }
      const result = await ctx.prisma.part.update({
        where: { id: id },
        data: { name: name, type: type },
      });
      const dancerData = await ctx.prisma.dancer.findFirst({
        where: { id: result.dancerId },
        include: { parts: true }
      });
      const payload: DancerPayload = {
        mutation: dancerMutation.UPDATED,
        editBy: ctx.userID,
        dancerData
      };
      await publish(payload);
      return { partData: result, ok: true, msg: "successfully edit part"};
    }
    return {
      ok: false,
      msg: "no part found",
    };
  }

  @Mutation((returns) => PartResponse)
  async deletePart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") delPartData: DeletePartInput,
    @Ctx() ctx: TContext
  ) {
    const { id } = delPartData;
    const part = await ctx.prisma.part.findFirst({
      where: { id },
    });
    if(!part) return { ok: false, msg: "no part found" };
    const deletedPart = await ctx.prisma.part.delete({
      where: { id }
    });
    const dancerData = await ctx.prisma.dancer.findFirst({
      where: { id: deletedPart.dancerId },
      include: { parts: true }
    });
    await initRedisControl();
    await initRedisPosition();
    const payload: DancerPayload = {
      mutation: dancerMutation.DELETED,
      editBy: ctx.userID,
      dancerData
    };
    await publish(payload);
    return {ok: true, msg: "successfully delete part"};
  }

  @FieldResolver((returns)=>[ControlData])
  async controlData(@Root() part: Part, @Ctx() ctx: TContext) {
    const result = await ctx.prisma.controlData.findMany({
      where: { partId: part.id },
      include: { frame: true },
    });
    // return data
    return result;
  }
}
