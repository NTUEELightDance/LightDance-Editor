import {
    Resolver,
    Query,
    Mutation,
    FieldResolver,
    Ctx,
    Arg,
    Root,
    Float,
    ID
} from 'type-graphql';
import { ControlFrame } from './types/controlFrame';
import { EditControlFrameInput } from './inputs/controlFrame';
import { Part } from './types/part'
import { generateID } from '../utility';
import { ControlDefault } from './types/controlType';

@Resolver(of => ControlFrame)
export class ControlFrameResolver {
    @Query(returns => ControlFrame)
    async controlFrame(@Arg("start") start: number, @Ctx() ctx: any) {
        return await ctx.db.ControlFrame.findOne({ start: start });
    }

    @Query(returns => [ID])
    async controlFrameIDs(@Ctx() ctx: any) {
        let frames = await ctx.db.ControlFrame.find()
        const id = frames.map((frame: ControlFrame) => frame.id)
        return id
    }
    // @FieldResolver()
    // async id(@Root() controlframe: any, @Ctx() ctx: any) {
    //     return controlframe._id
    // }

    @Mutation(returns => ControlFrame)
    async addControlFrame(@Arg("start", { nullable: false }) start: number, @Ctx() ctx: any) {
        let newControlFrame = new ctx.db.ControlFrame({ start: start, fade: false, id: generateID() });
        let allParts = await ctx.db.Part.find();
        allParts.map(async (part: Part) => {
            let newControl = new ctx.db.Control({ frame: newControlFrame, value: ControlDefault[part.type] });
            await newControl.save()
            await ctx.db.Part.findOneAndUpdate({ name: part.name }, { name: part.name, type: part.type, controlData: part.controlData.concat([newControl]) });
        });
        return newControlFrame.save();
    }

    @Mutation(returns => ControlFrame)
    async editControlFrame(@Arg("input") input: EditControlFrameInput, @Ctx() ctx: any){
        let frameToEdit = await ctx.db.findOne({_id: input.id});
        if (frameToEdit.editing && frameToEdit.editing !== ctx.userID){
            throw new Error("The frame is now editing by other user.");
        }
    }
}
