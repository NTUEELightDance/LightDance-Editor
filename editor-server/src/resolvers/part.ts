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
import { ControlDefault } from "./types/controlType";
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
    const existDancer = await ctx.prisma.dancer.findFirst({
      where: { name: newPartData.dancerName },
      include: { parts: true },
    });

    if (existDancer) {
      const duplicatePartName = await existDancer.parts.filter(
        (part: Part) => part.name === newPartData.name
      );
      if (duplicatePartName.length === 0) {
        const newPart = await ctx.prisma.part.create({
          data: {
            dancerId: existDancer.id,
            name: newPartData.name,
            type: newPartData.type,
          },
        });

        const allControlFrames: ControlFrame[] = await ctx.prisma.controlFrame.findMany();
        await ctx.prisma.controlData.createMany({
          data: allControlFrames.map(controlFrame=>(
            {
              partId: newPart.id,
              frameId: controlFrame.id,
              value: ControlDefault[newPartData.type],
            }
          ))
        });
        // for each position frame, add empty position data to the dancer
        await ctx.prisma.dancer.update({
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
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
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
    const edit_part = await ctx.prisma.part.findFirst({
      where: { id },
      include: { controlData: true },
    });
    if (edit_part) {
      if (edit_part.type !== type) {
        edit_part.controlData.map(async (id) => { // id is what?
          await ctx.prisma.controlData.update({
            where: { partId_frameId: { partId: edit_part.id, frameId:id.frameId } },
            data: { value: ControlDefault[type] },
          });
          console.log(`id: ${id}`);
        });
        const result = await ctx.prisma.part.update({
          where: { id: id },
          data: { name: name, type: type },
        });
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
        };
        await publish(payload);
        return { partData: result, ok: true, msg: "successfully edit part"};
      }
      return {
        ok: false,
        msg: "part type no change",
      };
    }
    return {
      ok: false,
      msg: "no part found",
    };
  }

  @Mutation((returns) => PartResponse)
  async deletePart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: DeletePartInput,
    @Ctx() ctx: TContext
  ) {
    const { id, dancerName } = newPartData;
    const part = await ctx.prisma.part.findFirst({
      where: { id },
      include: { controlData: true },
    });
    if (part) {
      const dancer = await ctx.prisma.dancer.findFirst({
        where: { name: dancerName },
        include: { parts: true },
      });
      if(dancer&&part.dancerId===dancer.id) {
        await ctx.prisma.controlData.deleteMany({
          where: { partId: id },
        });
        await ctx.prisma.dancer.update({
          where: { id: dancer.id },
          data: {
            parts: {
              delete: {
                id: part.id,
              },
            },
          },
        });
        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
        };
        await publish(payload);
        return {ok: true, msg: "successfully delete part"};
      }
      return {
        ok: false,
        msg: "no dancer found",
      };
    }else{
      return {
        ok: false,
        msg: "no part found",
      };
    }
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
