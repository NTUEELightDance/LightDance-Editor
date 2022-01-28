import { Resolver, FieldResolver, ID, Ctx, Root, Query } from 'type-graphql'
import { PositionFrame } from './types/positionFrame'


@Resolver(of => PositionFrame)
export class PositionFrameResolver {
    @Query(returns => [ID])
    async positionFrameIDs(@Ctx() ctx: any) {
        let frames = await ctx.db.PositionFrame.find()
        const id = frames.map((frame: PositionFrame) => frame.id)
        return id
    }
}
