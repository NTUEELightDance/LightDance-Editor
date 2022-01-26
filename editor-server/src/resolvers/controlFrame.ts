import { Resolver, FieldResolver, ID, Ctx, Root, Query } from 'type-graphql'
import { ControlFrame } from './types/controlFrame'


@Resolver(of => ControlFrame)
export class ControlFrameResolver {
    @Query(returns => [ID])
    async controlFrameIDs(@Ctx() ctx: any) {
        let frames = await ctx.db.ControlFrame.find()
        const id = frames.map((frame: ControlFrame) => frame.id)
        return id
    }
    @FieldResolver()
    async id(@Root() controlframe: any, @Ctx() ctx: any) {
        return controlframe._id
    }
}
