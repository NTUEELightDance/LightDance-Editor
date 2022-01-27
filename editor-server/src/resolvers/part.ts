import {
    Resolver,
    Query,
    Mutation,
    FieldResolver,
    Ctx,
    Arg,
    Root,
    PubSub,
    Publisher
} from 'type-graphql';
import { Control } from './types/control';
import { Part } from './types/part';
import { Dancer } from './types/dancer';
import { AddPartInput, EditPartInput } from './inputs/part';
import { ControlFrame } from './types/controlFrame';
import { Position } from './types/position'
import { ControlDefault } from './types/controlType';
import { Topic } from './subscriptions/topic';
import { DancerPayload, dancerMutation } from './subscriptions/dancer';
import { generateID } from '../utility';

@Resolver(of => Part)
export class PartResolver {
    @Mutation(returns => Part)
    async addPart(
        @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
        @Arg("part") newPartData: AddPartInput,
        @Ctx() ctx: any
    ): Promise<Part> {
        const existDancer = await ctx.db.Dancer.findOne({ name: newPartData.dancerName }).populate('parts')
        if (existDancer) {
            const duplicatePartName = existDancer.parts.filter((part: Part) => part.name === newPartData.name);
            console.log(duplicatePartName)
            if (duplicatePartName.length === 0) {
                console.log("no duplicate")
            }
        }



        let newPart = new ctx.db.Part({ name: newPartData.name, type: newPartData.type, value: ControlDefault[newPartData.type], id: generateID() })
        let allControlFrames = await ctx.db.ControlFrame.find()
        allControlFrames.map(async (controlframe: ControlFrame) => {
            let newControl = new ctx.db.Control({ frame: controlframe.id, value: ControlDefault[newPartData.type] })
            newPart.controlData.push(newControl._id)
            await newControl.save()
        })

        // for each position frame, add empty position data to the dancer
        const dancer = await ctx.db.Dancer.update({ name: newPartData.dancerName }, { $push: { parts: newPart._id } })
        const result = await newPart.save()
        const dancerData = await ctx.db.Dancer.findOne({ name: newPartData.dancerName }).populate('parts').populate('positionData')
        const payload: DancerPayload = {
            mutation: dancerMutation.UPDATED,
            editBy: ctx.userID,
            dancerData
        }
        await publish(payload)
        // save dancer
        return result
    }

    @Mutation(returns => Part)
    async editPart(
        @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
        @Arg("part") newPartData: EditPartInput,
        @Ctx() ctx: any
    ): Promise<Part> {
        const { id, name, type } = newPartData
        const edit_part = await ctx.db.Part.findOne({ _id: id })
        if (edit_part.type !== type) {
            edit_part.controlData.map(async (id: string) => {
                const data = await ctx.db.Control.findOneAndUpdate({ _id: id }, { value: ControlDefault[type] })
                console.log(data)
            })
        }
        const result = await ctx.db.Part.findOneAndUpdate({ _id: id }, { name, type })
        const dancerData = await ctx.db.Dancer.findOne({ _id: id }).populate('parts').populate('positionData')
        const payload: DancerPayload = {
            mutation: dancerMutation.UPDATED,
            editBy: ctx.userID,
            dancerData
        }
        await publish(payload)
        return result
    }

    @FieldResolver()
    async controlData(@Root() part: any, @Ctx() ctx: any) {
        const result = await Promise.all(part.controlData.map(async (ref: string) => {
            const data = await ctx.db.Control.findOne({ _id: ref }).populate("frame")
            return data
        })).then(result => {
            // console.log(result)
            return result
        })
        // return data

        return result
    }


}