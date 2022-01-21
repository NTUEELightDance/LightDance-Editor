import {
    Resolver,
    Query,
    FieldResolver,
    Arg,
    Ctx,
    Root,
    Mutation,
    Int,
    ResolverInterface,
} from 'type-graphql';
import { ColorInput } from './types/color-input'

@Resolver()
class ColorResolver {
    @Query(returns => String)
    async color(@Arg("color") color: string, @Ctx() ctx: any) {
        console.log(color)
        let { colorCode } = await ctx.db.Color.findOne({ color })
        console.log(colorCode)
        return colorCode
    }

    @Mutation(returns => String)
    async updateColor(@Arg("color") colorInput: ColorInput, @Ctx() ctx: any) {
        let existedColorCode = await ctx.db.Color.findOne({ color: colorInput.color })
        if (!existedColorCode) {
            let newColor = new ctx.db.Color({ color: colorInput.color, colorCode: colorInput.colorCode })
            await newColor.save()
        }
        else {
            await ctx.db.Color.findOneAndUpdate({ color: colorInput.color }, { colorCode: colorInput.colorCode })
        }
        return colorInput.colorCode
    }
}

export default ColorResolver