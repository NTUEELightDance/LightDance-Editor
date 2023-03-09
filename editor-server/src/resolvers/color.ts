import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Publisher,
  PubSub,
  Int,
} from "type-graphql";

import { Topic } from "./subscriptions/topic";
import { ColorPayload, colorMutation } from "./subscriptions/color";
import { ColorMap } from "./types/colorMap";
import { ColorResponse } from "./response/colorResponse";
import { IControl, IControlFrame, TContext } from "../types/global";
import {
  Color,
  ColorCreateInput,
  ColorUpdateInput,
} from "../../prisma/generated/type-graphql";

@Resolver()
class ColorResolver {
  @Query(() => ColorMap)
  async colorMap(@Ctx() ctx: TContext) {
    const colors = await ctx.prisma.color.findMany();
    return { colorMap: colors };
  }

  @Mutation(() => Color)
  async editColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("id", () => Int) id: number,
    @Arg("data") data: ColorUpdateInput,
    @Ctx() ctx: TContext
  ) {
    // Check colorCode dimension
    const { colorCode } = data;
    if (colorCode) {
      const { set } = colorCode;
      if (set && set.length !== 3) {
        throw new Error(`colorCode dimension should be 3, get ${set.length}`);
      }
    }

    await ctx.prisma.color.findUniqueOrThrow({
      where: { id },
    });

    const colorData = await ctx.prisma.color.update({
      where: { id },
      data: data,
    });

    const payload: ColorPayload = {
      mutation: colorMutation.UPDATED,
      id: id,
      color: colorData.color,
      colorCode: colorData.colorCode,
      editBy: ctx.userId,
    };
    await publish(payload);

    return colorData;
  }

  @Mutation(() => Color)
  async addColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: ColorCreateInput,
    @Ctx() ctx: TContext
  ) {
    // Check colorCode dimension
    const { colorCode } = colorInput;
    if (colorCode) {
      const { set } = colorCode;
      if (set.length !== 3) {
        throw new Error(`colorCode dimension should be 3, get ${set.length}`);
      }
    }

    // Create new Color, if "color" duplicate => create() will throw error
    const color = await ctx.prisma.color.create({
      data: colorInput,
    });

    // publish
    const payload: ColorPayload = {
      mutation: colorMutation.CREATED,
      id: color.id,
      color: color.color,
      colorCode: color.colorCode,
      editBy: ctx.userId,
    };
    await publish(payload);

    return color;
  }

  // @Mutation(() => String)
  // async renameColor(
  //   @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
  //   @Arg("originalColor") originalColor: string,
  //   @Arg("newColor") newColor: string,
  //   @Ctx() ctx: TContext
  // ) {
  //   // check if new color name exists, if true => throw error
  //   const existedNewColor = await ctx.prisma.color.findUnique({
  //     where: { color: newColor },
  //   });
  //   if (existedNewColor) {
  //     throw new Error(
  //       `color name: ${newColor}/code: ${existedNewColor.colorCode} existed`
  //     );
  //   }

  //   // check if old color name exists, if not => throw error
  //   await ctx.prisma.color.findUniqueOrThrow({
  //     where: { color: originalColor },
  //   });

  //   // check if color is used in ControlData
  //   const checkColorInControl = await ctx.prisma.controlData.findMany({
  //     where: { value: { path: ["color"], equals: originalColor } },
  //   });
  //   if (checkColorInControl.length !== 0) {
  //     throw new Error(`color is used in ControlData`);
  //   }

  //   await ctx.prisma.color.update({
  //     where: { color: originalColor },
  //     data: { color: newColor },
  //   });

  //   // publish
  //   const payload: ColorPayload = {
  //     mutation: colorMutation.RENAMED,
  //     color: originalColor,
  //     renameColor: newColor,
  //     editBy: ctx.userId,
  //   };
  //   await publish(payload);

  //   return newColor;
  // }

  @Mutation(() => ColorResponse)
  async deleteColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: TContext
  ) {
    try {
      // check if color id exists
      const existedColor = await ctx.prisma.color.findUniqueOrThrow({
        where: { id: id },
      });

      // check whether color is using in Control
      const checkControl = await ctx.prisma.controlData.findMany({
        where: { value: { path: ["color"], equals: id } },
      });
      if (checkControl.length !== 0) {
        let checkControlFrames: number[] = checkControl.map(
          (control) => control.frameId
        );
        checkControlFrames = checkControlFrames.sort(function (a, b) {
          return a - b;
        });
        let frame = 0;
        const ids: number[] = [];
        checkControlFrames.map((controlFrame) => {
          if (controlFrame !== frame) {
            ids.push(controlFrame);
            frame = controlFrame;
          }
        });
        return {
          id: id,
          ok: false,
          msg: `color is used in frames ${ids}`,
        };
      }

      // TODO: check whether color is using in LEDEffect
      const LEDEffects = await ctx.prisma.lEDEffect.findMany({
        select: { frames: true, id: true },
      });
      const ids: number[] = [];
      LEDEffects.map((LEDEffect) => {
        const { frames } = LEDEffect;
        const ledId = LEDEffect.id;
        frames.map((frame: any) => {
          const LEDs = frame.LEDs;
          LEDs.map((led: any) => {
            if (led[0].toString() === id.toString() && !ids.includes(ledId)) {
              ids.push(ledId);
            }
          });
        });
      });
      if (ids.length !== 0)
        return {
          id: id,
          ok: false,
          msg: `color is used in led ${ids}`,
        };

      // Delete Color
      const deleteColor = await ctx.prisma.color.delete({
        where: { id: id },
      });
      const payload: ColorPayload = {
        mutation: colorMutation.DELETED,
        id: id,
        editBy: ctx.userId,
      };
      await publish(payload);
      return { id: id, ok: true };
    } catch (error) {
      console.log(error);
      return Object.assign(
        { id: id },
        { ok: false, msg: `color id ${id} doesn't existed` }
      );
    }
  }
}

export default ColorResolver;
