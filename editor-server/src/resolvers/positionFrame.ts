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
    async addPositionFrame(@Arg("start", { nullable: false }) start: number, @Ctx() ctx: any) {
        let newPositionFrame = new ctx.db.PositionFrame({ start: start, fade: false, id: generateID() });
        let allDancers = await ctx.db.Dancer.find();
        allDancers.map(async (dancer: Dancer) => {
            let newPosition = new ctx.db.Position({ frame: newPositionFrame, x:0, y: 0, z: 0, id: generateID()});
            await newPosition.save()
            await ctx.db.Dancer.findOneAndUpdate({ id: dancer.id }, {
            name: dancer.name,
            parts: dancer.parts ,
            positionData: dancer.positionData.concat([newPosition]),
            id: dancer.id});
        });
        return newPositionFrame.save();
    }

    @Mutation(returns => PositionFrame)
    async editPositionFrame(@Arg("input") input: EditPositionFrameInput, @Ctx() ctx: any) {
        let frameToEdit = await ctx.db.findOne({ _id: input.id });
        if (frameToEdit.editing && frameToEdit.editing !== input.user) {
            throw new Error("The frame is now editing by other user.");
        }
        return await ctx.db.findOneAndUpdate({ _id: input.id }, input);
    }
}
