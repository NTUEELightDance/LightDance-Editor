import {
    Resolver,
    Query,
    Mutation,
    FieldResolver,
    Ctx,
    Arg,
    Root,
} from 'type-graphql';
import { Control } from './types/control';
import { Part } from './types/part';
import { Dancer } from './types/dancer';
import { AddPartInput, EditPartInput } from './inputs/part';
import { ControlFrame } from './types/controlFrame';
import { Position } from './types/position'
import { ControlDefault } from './types/controlType';

@Resolver(of => Part)
export class PartResolver {
    @Mutation(returns => Part)
    async addPart(@Arg("part") newPartData: AddPartInput, @Ctx() ctx: any): Promise<Part> {
        let newPart = new ctx.db.Part({ name: newPartData.name, type: newPartData.type, value: ControlDefault[newPartData.type] })
        let allControlFrames = await ctx.db.ControlFrame.find()
        console.log(allControlFrames)
        allControlFrames.map(async (controlframe: ControlFrame) => {
            let newControl = new ctx.db.Control({ frame: controlframe.id, value: ControlDefault[newPartData.type] })
            newPart.controlData.push(newControl._id)
            await newControl.save()
        })

        // for each position frame, add empty position data to the dancer
        const dancer = await ctx.db.Dancer.update({ name: newPartData.dancerName }, { $push: { parts: newPart._id } })
        console.log(dancer)

        // save dancer
        return await newPart.save()
    }

    @Mutation(returns => Part)
    async editPart(@Arg("part") newPartData: EditPartInput, @Ctx() ctx: any): Promise<Part> {
        const { id, name, type } = newPartData
        const edit_part = await ctx.db.Part.findOne({ _id: id })
        if (edit_part.type !== type) {
            edit_part.controlData.map(async (id: string) => {
                const data = await ctx.db.Control.findOneAndUpdate({ _id: id }, { value: ControlDefault[type] })
                console.log(data)
            })
        }
        return ctx.db.Part.findOneAndUpdate({ _id: id }, { name, type })
    }

    @FieldResolver()
    async controlData(@Root() part: any, @Ctx() ctx: any) {
        const result = await Promise.all(part.controlData.map(async (ref: string) => {
            const data = await ctx.db.Control.findOne({ _id: ref }).populate("frame")
            console.log(data)
            return data
        })).then(result => {
            // console.log(result)
            return result
        })
        console.log(result)
        // return data

        return result
    }

    @FieldResolver()
    id(@Root() part: any, @Ctx() ctx: any) {
        return part._id
    }
}