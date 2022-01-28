import { Resolver, FieldResolver, ID, Ctx, Root, Query } from 'type-graphql'
import { PosMap } from './types/positionMap'


@Resolver(of => PosMap)
export class PosMapResolver {
    @Query(returns => PosMap)
    async PosMap(@Ctx() ctx: any) {
        let frames = await ctx.db.PositionFrame.find()
        const id = frames.map((frame: any) => { return { id: frame.id, _id: frame._id } })
        return { frames: id }
    }

}
