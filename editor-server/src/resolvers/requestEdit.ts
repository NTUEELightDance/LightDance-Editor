import { Resolver, FieldResolver, Root, Ctx, Mutation, Arg } from "type-graphql"
import { RequestEditResponse } from "./response/requestEditResponse"

@Resolver()
export class RequestEditResolver {
    @Mutation(returns => RequestEditResponse)
    async RequestEditControl(@Arg('FrameID') frameID: String, @Ctx() ctx: any) {
        const controlFrame = await ctx.db.ControlFrame.findOne({ id: frameID })
        if (!controlFrame.editing) {
            await ctx.db.ControlFrame.findOneAndUpdate({ editing: ctx.userID }, { editing: null })
            await ctx.db.ControlFrame.findOneAndUpdate({ id: frameID }, { editing: ctx.userID })
            return { editing: ctx.userID, ok: true }
        }
        else {
            if (controlFrame.editing !== ctx.userID) {
                return { editing: controlFrame.editing, ok: false }
            }
            return { editing: controlFrame.editing, ok: true }
        }
    }

    @Mutation(returns => RequestEditResponse)
    async RequestEditPosition(@Arg('FrameID') frameID: String, @Ctx() ctx: any) {
        const positionFrame = await ctx.db.PositionFrame.findOne({ id: frameID })
        if (!positionFrame.editing) {
            await ctx.db.PositionFrame.findOneAndUpdate({ editing: ctx.userID }, { editing: null })
            await ctx.db.PositionFrame.findOneAndUpdate({ id: frameID }, { editing: ctx.userID })
            return { editing: ctx.userID, ok: true }
        }
        else {
            if (positionFrame.editing !== ctx.userID) {
                return { editing: positionFrame.editing, ok: false }
            }
            return { editing: positionFrame.editing, ok: true }
        }
    }
}