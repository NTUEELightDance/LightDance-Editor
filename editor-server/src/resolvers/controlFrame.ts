import {
    Resolver,
    Query,
    Mutation,
    FieldResolver,
    Ctx,
    Arg,
    Root,
    Float,
    PubSub,
    Publisher,
    ID
} from 'type-graphql';
import { ControlFrame } from './types/controlFrame';
import { EditControlFrameInput } from './inputs/controlFrame';
import { Part } from './types/part'
import { generateID } from '../utility';
import { ControlDefault } from './types/controlType';
import { Topic } from './subscriptions/topic';
import { ControlMapPayload, ControlMapMutation } from './subscriptions/controlMap';

@Resolver(of => ControlFrame)
export class ControlFrameResolver {
    @Query(returns => ControlFrame)
    async controlFrame(@Arg("start") start: number, @Ctx() ctx: any) {
        return await ctx.db.ControlFrame.findOne({ start: start });
    }

    @Query(returns => [ID])
    async controlFrameIDs(@Ctx() ctx: any) {
        let frames = await ctx.db.ControlFrame.find().sort({start: 1})
        const id = frames.map((frame: ControlFrame) => frame.id)
        return id
    }
    // @FieldResolver()
    // async id(@Root() controlframe: any, @Ctx() ctx: any) {
    //     return controlframe._id
    // }

    @Mutation(returns => ControlFrame)
    async addControlFrame(
        @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
        @Arg("start", { nullable: false }) start: number, 
        @Ctx() ctx: any
    ) {
        const newControlFrame = await new ctx.db.ControlFrame({ start: start, fade: false, id: generateID() }).save();
        let allParts = await ctx.db.Part.find();
        allParts.map(async (part: Part) => {
            let newControl = await new ctx.db.Control({ frame: newControlFrame, value: ControlDefault[part.type], id: generateID()});
            await newControl.save()
            await ctx.db.Part.findOneAndUpdate({ id: part.id}, {
                name: part.name,
                type: part.type,
                controlData: part.controlData.concat([newControl]),
                id: part.id
            });
        });
        const payload: ControlMapPayload = {
                mutation: ControlMapMutation.CREATED,
                editBy: ctx.userID,
                frames: [{_id: newControlFrame._id, id: newControlFrame.id}]
        }
        await publishControlMap(payload)
        return newControlFrame;
    }

    @Mutation(returns => ControlFrame)
    async editControlFrame(
        @PubSub(Topic.ControlMap) publishControlMap: Publisher<ControlMapPayload>,
        @Arg("input") input: EditControlFrameInput, 
        @Ctx() ctx: any
    ){
        let frameToEdit = await ctx.db.ControlFrame.findOne({id: input.id});
        if (frameToEdit.editing && frameToEdit.editing !== ctx.userID){
            throw new Error("The frame is now editing by other user.");
        }
        await ctx.db.ControlFrame.updateOne({id: input.id}, input); 
        const controlFrame = await ctx.db.ControlFrame.findOne({id: input.id})
        const payload: ControlMapPayload = {
                mutation: ControlMapMutation.CREATED,
                editBy: ctx.userID,
                frames: [{_id: controlFrame._id, id: controlFrame.id}]
        }
        await publishControlMap(payload) 
        return controlFrame
    }
}
