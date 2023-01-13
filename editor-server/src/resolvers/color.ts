import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Publisher,
  PubSub,
} from "type-graphql";

import { ColorInput, addColorInput, editColorInput } from "./inputs/color";
import { Topic } from "./subscriptions/topic";
import { ColorPayload, colorMutation } from "./subscriptions/color";
import { ColorMap } from "./types/colorMap";
import { Color } from "./types/color";
import { ColorResponse } from "./response/colorResponse";

@Resolver()
class ColorResolver {
  @Query((returns) => String)
  async color(@Arg("color") color: string, @Ctx() ctx: any) {
    const { colorCode } = await ctx.db.Color.findOne({ color });
    return colorCode;
  }

  @Query((returns) => ColorMap)
  async colorMap(@Ctx() ctx: any) {
    const colors = await ctx.db.Color.find();
    return { colorMap: colors };
  }

  @Query((returns) => [Color])
  async getColors(@Ctx() ctx: any) {
    const colors = await ctx.db.Color.find();
    return colors;
  }

  @Mutation((returns) => String)
  async updateColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: ColorInput,
    @Ctx() ctx: any
  ) {
    const existedColorCode = await ctx.db.Color.findOne({
      color: colorInput.color,
    });
    if (!existedColorCode) {
      const newColor = new ctx.db.Color({
        color: colorInput.color,
        colorCode: colorInput.colorCode,
      });
      await newColor.save();
      const payload: ColorPayload = {
        mutation: colorMutation.CREATED,
        color: colorInput.color,
        colorCode: colorInput.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
    } else {
      await ctx.db.Color.findOneAndUpdate(
        { color: colorInput.color },
        { colorCode: colorInput.colorCode }
      );
      const payload: ColorPayload = {
        mutation: colorMutation.UPDATED,
        color: colorInput.color,
        colorCode: colorInput.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
    }
    return colorInput.colorCode;
  }

  @Mutation((returns) => Color)
  async addColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: addColorInput,
    @Ctx() ctx: any
  ) {
    // check if color name and color code exists
    const existedColorName = await ctx.db.Color.findOne({
      color: colorInput.color,
    });
    const existedColorCode = await ctx.db.Color.findOne({
      colorCode: colorInput.colorCode,
    });

    // if doesn't exist
    if (!existedColorCode && !existedColorName) {
      const newColor = new ctx.db.Color({
        color: colorInput.color,
        colorCode: colorInput.colorCode,
      });
      await newColor.save();
      const payload: ColorPayload = {
        mutation: colorMutation.CREATED,
        color: colorInput.color,
        colorCode: colorInput.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return newColor;
    }
    // if exist
    else {
      throw new Error(
        `color name: ${colorInput.color}/code: ${colorInput.colorCode} existed`
      );
    }
  }

  @Mutation((returns) => Color)
  async editColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: editColorInput,
    @Ctx() ctx: any
  ) {
    // check if color name and color code exists
    const existedOriginalColorName = await ctx.db.Color.findOne({
      color: colorInput.original_color,
    });
    let existedNewColorName = null;
    if (colorInput.original_color !== colorInput.new_color) {
      existedNewColorName = await ctx.db.Color.findOne({
        color: colorInput.new_color,
      });
    }

    let existedColorCode = null;
    if (
      existedOriginalColorName &&
      colorInput.colorCode !== existedOriginalColorName.colorCode
    ) {
      existedColorCode = await ctx.db.Color.findOne({
        colorCode: colorInput.colorCode,
      });
    }

    // if exist -> edit
    if (existedOriginalColorName && !existedColorCode && !existedNewColorName) {
      const { original_color, colorCode, new_color } = colorInput;
      const newColor = await ctx.db.Color.findOneAndUpdate(
        { color: original_color },
        { color: new_color, colorCode },
        { new: true }
      );
      const payload: ColorPayload = {
        mutation: colorMutation.UPDATED,
        color: colorInput.new_color,
        colorCode: colorInput.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return newColor;
    }
    // if doesn't exist -> throw error
    else if (!existedOriginalColorName) {
      throw new Error(`color ${colorInput.original_color} doesn't exist`);
    } else {
      throw new Error(
        `color name: ${colorInput.new_color}/code: ${colorInput.colorCode} existed`
      );
    }
  }

  @Mutation((returns) => ColorResponse)
  async deleteColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") color: string,
    @Ctx() ctx: any
  ) {
    // check if color name and color code exists
    const existedColor = await ctx.db.Color.findOne({
      color,
    });

    const checkControl = await ctx.db.Control.find({ "value.color": color });
    if (checkControl.length != 0) {
      const allControlFrame = await ctx.db.ControlFrame.find({}, "_id").sort({
        start: 1,
      });
      const allControlFrameID = allControlFrame.map((Obj: any) =>
        String(Obj._id)
      );
      const ids: any[] = [];
      checkControl.map((controlObj: any) => {
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

    // if exist -> edit
    if (existedColor) {
      const deletedColor = await ctx.db.Color.findOneAndDelete({ color });
      const payload: ColorPayload = {
        mutation: colorMutation.DELETED,
        color: deletedColor.color,
        colorCode: deletedColor.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return Object.assign(deletedColor, { ok: true });
    }
    // if doesn't exist -> throw error
    else {
      return Object.assign(
        { color, colorCode: "" },
        { ok: false, msg: `color ${color} doesn't existed` }
      );
    }
  }
}

export default ColorResolver;
