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
import { generateID } from "../utility";

@Resolver()
class ColorResolver {
  @Query((returns) => String)
  async color(@Arg("color") color: string, @Ctx() ctx: any) {
    console.log(color);
    let { colorCode } = await ctx.db.Color.findOne({ color });
    console.log(colorCode);
    return colorCode;
  }

  @Query((returns) => ColorMap)
  async colorMap(@Ctx() ctx: any) {
    const colors = await ctx.db.Color.find();
    console.log(colors);
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
    let existedColorCode = await ctx.db.Color.findOne({
      color: colorInput.color,
    });
    if (!existedColorCode) {
      let newColor = new ctx.db.Color({
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
        id: generateID(),
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
      throw new Error("color name/code existed");
    }
  }

  @Mutation((returns) => Color)
  async editColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("color") colorInput: editColorInput,
    @Ctx() ctx: any
  ) {
    // check if color name and color code exists
    const existedColor = await ctx.db.Color.findOne({
      id: colorInput.id,
    });
    const existedColorName = await ctx.db.Color.findOne({
      color: colorInput.color,
      id: { $ne: colorInput.id },
    });
    const existedColorCode = await ctx.db.Color.findOne({
      colorCode: colorInput.colorCode,
      id: { $ne: colorInput.id },
    });

    // if exist -> edit
    if (existedColor && !existedColorCode && !existedColorName) {
      const { id, color, colorCode } = colorInput;
      const newColor = await ctx.db.Color.findOneAndUpdate(
        { id },
        { color, colorCode },
        { new: true }
      );
      const payload: ColorPayload = {
        mutation: colorMutation.UPDATED,
        color: colorInput.color,
        colorCode: colorInput.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return newColor;
    }
    // if doesn't exist -> throw error
    else if (!existedColor) {
      throw new Error("color doesn't exist");
    } else {
      throw new Error("color name/code already exists");
    }
  }

  @Mutation((returns) => Color)
  async deleteColor(
    @PubSub(Topic.Color) publish: Publisher<ColorPayload>,
    @Arg("colorID") colorID: string,
    @Ctx() ctx: any
  ) {
    // check if color name and color code exists
    const existedColor = await ctx.db.Color.findOne({
      id: colorID,
    });

    // if exist -> edit
    if (existedColor) {
      const deletedColor = await ctx.db.Color.findOneAndDelete({ id: colorID });
      const payload: ColorPayload = {
        mutation: colorMutation.DELETED,
        color: deletedColor.color,
        colorCode: deletedColor.colorCode,
        editBy: ctx.userID,
      };
      await publish(payload);
      return deletedColor;
    }
    // if doesn't exist -> throw error
    else {
      throw new Error("color name/code doesn't existed");
    }
  }
}

export default ColorResolver;
