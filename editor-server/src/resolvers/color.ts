import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Publisher,
  PubSub,
} from "type-graphql";
import { ColorInput } from "./inputs/color";
import { Topic } from "./subscriptions/topic";
import { ColorPayload, colorMutation } from "./subscriptions/color";
import { ColorMap } from "./types/colorMap";

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
}

export default ColorResolver;
