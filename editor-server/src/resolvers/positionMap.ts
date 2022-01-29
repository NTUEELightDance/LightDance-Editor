import { Resolver, FieldResolver, ID, Ctx, Arg, Query, Mutation } from 'type-graphql'
import { PosMap } from './types/positionMap'
import { EditPositionInput } from './inputs/position'


@Resolver(of => PosMap)
export class PosMapResolver {
    @Query(returns => PosMap)
    async PosMap(@Ctx() ctx: any) {
        let frames = await ctx.db.PositionFrame.find()
        const id = frames.map((frame: any) => { return { id: frame.id, _id: frame._id } })
        return { frames: id }
    }

    @Mutation(returns => PosMap)
    async editPosMap(
        @Arg("controlDatas", type => [EditPositionInput]) positionDatas: EditPositionInput[],
        @Arg("frameID") frameID: string,
        @Ctx() ctx: any
    ) {
        const { editing, _id } = await ctx.db.PositionFrame.findOne({ id: frameID })
        if (editing !== ctx.userID) {
            throw new Error("The frame is now editing by other user.");
        }
        await Promise.all(
            positionDatas.map(async (data: any) => {
                const { dancerName, positionDatas } = data
                const dancer = await ctx.db.Dancer.findOne({ name: dancerName }).populate("positionData")
                dancer.positionData.map(async (position: any) => {
                    if (position.frame.toString() === _id.toString()) {
                        await ctx.db.Position.updateOne({ _id: position._id }, { x: positionDatas.x, y: positionDatas.y, z: positionDatas.z })
                    }
                })
            })
        )

        // const payload: ControlMapPayload = {
        //     mutation: ControlMapMutation.UPDATED,
        //     editBy: ctx.userID,
        //     frames: [{ _id, id: frameID }]
        // }
        // await publish(payload)
        return { frames: [{ _id, id: frameID }] }
    }
}


