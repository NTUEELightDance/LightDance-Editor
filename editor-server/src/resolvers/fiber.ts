import { Resolver, FieldResolver, Root, Ctx } from "type-graphql"
import { FIBER } from "./types/controlDevice"

@Resolver(of => FIBER)
export class FiberResolver {
    @FieldResolver()
    async color(@Root() fiber: FIBER, @Ctx() ctx: any) {
        const color = await ctx.db.Color.findOne({ color: fiber.color })
        if (color)
            return color.colorCode
        return null
    }
}