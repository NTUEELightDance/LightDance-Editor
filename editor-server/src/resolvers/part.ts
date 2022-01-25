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
import { AddPartInput } from './inputs/part';
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
            newPart.controlData.push(newControl)
            await newControl.save()
        })

        // for each position frame, add empty position data to the dancer
        let dancer = await ctx.db.Dancer.update({ name: newPartData.dancerName }, { $push: { parts: newPart._id } })
        console.log(dancer)

        // save dancer
        return await newPart.save()
    }

    @FieldResolver()
    async controlData(@Root() part: any, @Ctx() ctx: any) {
        console.log(part)
        const controlDataRef = part.controlData
        let data = controlDataRef.map(async (ref: string) => {
            await ctx.db.Control.findOne({ _id: ref })
        })
        console.log(data)
        return data
    }
}