import { Resolver, ID, Ctx, Query, Arg, Mutation} from 'type-graphql';
import { PositionFrame } from './types/positionFrame';
import { Dancer } from './types/dancer'
import { generateID } from '../utility';
import { EditPositionFrameInput } from './inputs/positionFrame';


@Resolver(of => PositionFrame)
export class PositionFrameResolver {
    @Query(returns => PositionFrame)
    async positionFrame(@Arg("start") start: number, @Ctx() ctx: any) {
        return await ctx.db.PositionFrame.findOne({ start: start });
    }

    @Query(returns => [ID])
    async positionFrameIDs(@Ctx() ctx: any) {
        let frames = await ctx.db.PositionFrame.find()
        const id = frames.map((frame: PositionFrame) => frame.id)
        return id
    }

    @Mutation(returns => PositionFrame)
    async addPositionFrame(
        @Arg("start", { nullable: false }) start: number, 
        @Ctx() ctx: any
    ) {
        const newPositionFrame = new ctx.db.PositionFrame({ start: start, fade: false, id: generateID() }).save();
        let allDancers = await ctx.db.Dancer.find();
        allDancers.map(async (dancer: Dancer) => {
            let newPosition = new ctx.db.Position({ frame: newPositionFrame, x:0, y: 0, z: 0, id: generateID()});
            await newPosition.save()
            await ctx.db.Dancer.findOneAndUpdate({ id: dancer.id }, {
                name: dancer.name,
                parts: dancer.parts ,
                positionData: dancer.positionData.concat([newPosition]),
                id: dancer.id
            });
        });
        // const payload: ControlMapPayload = {
        //         mutation: ControlMapMutation.CREATED,
        //         editBy: ctx.userID,
        //         frames: [{_id: newControlFrame._id, id: newControlFrame.id}]
        // }
        // await publishControlMap(payload)
        return newPositionFrame;
    }

    @Mutation(returns => PositionFrame)
    async editPositionFrame(
        @Arg("input") input: EditPositionFrameInput, 
        @Ctx() ctx: any
    ) {
        let frameToEdit = await ctx.db.PositionFrame.findOne({ id: input.id });
        if (frameToEdit.editing && frameToEdit.editing !== ctx.userID) {
            throw new Error("The frame is now editing by other user.");
        }
        await ctx.db.PositionFrame.updateOne({ id: input.id }, input);
        const positionFrame = await ctx.db.PositionFrame.findOne({ id: input.id }, input);
        // const payload: ControlMapPayload = {
        //         mutation: ControlMapMutation.CREATED,
        //         editBy: ctx.userID,
        //         frames: [{_id: controlFrame._id, id: controlFrame.id}]
        // }
        // await publishControlMap(payload) 
        return positionFrame
    }
}
