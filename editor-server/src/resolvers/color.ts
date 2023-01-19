import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Publisher,
  PubSub,
} from "type-graphql";

import { Topic } from "./subscriptions/topic";
import { ColorPayload, colorMutation } from "./subscriptions/color";
import { ColorMap } from "./types/colorMap";
import { ColorResponse } from "./response/colorResponse";
import { IControl, IControlFrame, TContext } from "../types/global";
import { Color, ColorCreateInput} from "../../prisma/generated/type-graphql";

@Resolver()
class ColorResolver {

  @Query(() => ColorMap)
  async colorMap(@Ctx() ctx: TContext) {
    const colors = await ctx.prisma.color.findMany();
    return { colorMap: colors };
  }

  @Mutation(() => Color)
  async editColorCodeByColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") color: string,
    @Arg("colorCode") colorCode: string,
    @Ctx() ctx: TContext
  ) {
    const existedColor = await ctx.prisma.color.findFirst({where: {color}});
    const colorData = await ctx.prisma.color.upsert({create: {color, colorCode}, update: {colorCode}, where: {color}});
    if (!existedColor) {
      const payload: ColorPayload = {
        mutation: colorMutation.CREATED,
        color: color,
        colorCode: colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
    } else {
      const payload: ColorPayload = {
        mutation: colorMutation.UPDATED,
        color: color,
        colorCode: colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
    }
    return colorData;
  }

  @Mutation(()=> Color)
  async addColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: ColorCreateInput,
    @Ctx() ctx: TContext
  ){
    // Check color Code Exist
    const checkColor = await ctx.prisma.color.findFirst({
      where: {colorCode: colorInput.colorCode}
    });
    if (checkColor){
      throw new Error(`ColorCode ${colorInput.colorCode} exist on color ${checkColor.color}`);
    }

    // Create new Color, if "color" duplicate => create() will throw error
    const color = await ctx.prisma.color.create({
      data: colorInput
    });

    // publish
    const payload: ColorPayload = {
      mutation: colorMutation.CREATED,
      color: colorInput.color,
      colorCode: colorInput.colorCode,
      editBy: ctx.userID,
    };
    await publish(payload);

    return color;
  }

  @Mutation(() => String)
  async renameColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("originalColor") originalColor: string,
    @Arg("newColor") newColor: string,
    @Ctx() ctx: TContext
  ) {
    // check if new color name exists, if true => throw error
    const existedNewColor = await ctx.prisma.color.findUnique({
      where: {color: newColor}
    });
    if (existedNewColor){
      throw new Error(
        `color name: ${newColor}/code: ${existedNewColor.colorCode} existed`
      );
    }

    // check if old color name exists, if not => throw error
    await ctx.prisma.color.findUniqueOrThrow({
      where: {color: originalColor}
    });

    await ctx.prisma.color.update({
      where: {color: originalColor}, data: {color: newColor}
    });

    // publish
    const payload: ColorPayload = {
      mutation: colorMutation.RENAMED,
      color: originalColor,
      renameColor: newColor,
      editBy: ctx.userID,
    };
    await publish(payload);

    return newColor;
  }

  @Mutation(() => ColorResponse)
  async deleteColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") color: string,
    @Ctx() ctx: TContext
  ) {
    try {
      // check if color name and color code exists
      const existedColor = await ctx.prisma.color.findUniqueOrThrow({
        where: {color}
      });

      // TODO: Apply Prisma
      // check whether color is using in Control
      const checkControl: IControl[] = await ctx.db.Control.find({ "value.color": color });
      if (checkControl.length != 0) {
        const allControlFrame: IControlFrame[] = await ctx.db.ControlFrame.find({}, "_id").sort({
          start: 1,
        });
        const allControlFrameID = allControlFrame.map((Obj) =>
          String(Obj._id)
        );
        const ids: number[] = [];
        checkControl.map((controlObj) => {
          const frame = String(controlObj.frame);
          const id = allControlFrameID.indexOf(frame);
          if (ids.indexOf(id) === -1) {
            ids.push(id);
          }
        });
        ids.sort((a, b) => a - b);
        return {
          color: color,
          colorCode: existedColor.colorCode,
          ok: false,
          msg: `color ${color} is used in ${ids}`,
        };
      }
      // TODO END

      // Delete Color
      await ctx.prisma.color.delete({where: {color}});
      const payload: ColorPayload = {
        mutation: colorMutation.DELETED,
        color: color,
        colorCode: existedColor.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return Object.assign(existedColor, { ok: true });
    } catch (error) {
      return Object.assign(
        { color, colorCode: "" },
        { ok: false, msg: `color ${color} doesn't existed` }
      );
    }
  }
}

export default ColorResolver;
