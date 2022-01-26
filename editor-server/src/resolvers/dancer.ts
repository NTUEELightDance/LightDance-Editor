import {
    Resolver,
    Query,
    Mutation,
    FieldResolver,
    Ctx,
    PubSub,
    Publisher,
    Arg,
    Root,
} from 'type-graphql';
import { Control } from './types/control';
import { Part } from './types/part';
import { Dancer } from './types/dancer';
import { AddDancerInput, editDancerInput } from './inputs/dancer';
import { PositionFrame } from './types/positionFrame';
import { Position } from './types/position'
import { Topic } from './subscriptions/topic';
import { DancerPayload, dancerMutation } from './subscriptions/dancer';
import { ControlFrame } from './types/controlFrame';

@Resolver(of => Dancer)
export class DancerResolver {
    @Query(returns => [Dancer])
    async dancer(@Ctx() ctx: any) {
        let dancers = await ctx.db.Dancer.find().populate('parts').populate('positionData')
        return dancers
    }

    @Mutation(returns => Dancer)
    async addDancer(
        @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
        @Arg("dancer") newDancerData: AddDancerInput,
        @Ctx() ctx: any
    ): Promise<Dancer> {
        let newDancer = new ctx.db.Dancer({ name: newDancerData.name, parts: [], positionData: [] })

        // for each position frame, add empty position data to the dancer
        let allPositionFrames = await ctx.db.PositionFrame.find()
        console.log(allPositionFrames)
        allPositionFrames.map(async (positionframe: PositionFrame) => {
            let newPosition = new ctx.db.Position({ frame: positionframe.id, x: 0, y: 0, z: 0 })
            newDancer.positionData.push(newPosition)
            await newPosition.save()
        })
        const dancerData = await newDancer.save()
        const payload: DancerPayload = {
            mutation: dancerMutation.CREATED,
            editBy: ctx.userID,
            dancerData
        }
        await publish(payload)

        // save dancer
        return dancerData
    }

    @Mutation(returns => Dancer)
    async editDancer(@Arg("dancer") newDancerData: editDancerInput, @Ctx() ctx: any): Promise<Dancer> {
        const { id, name } = newDancerData
        return ctx.db.Dancer.findOneAndUpdate({ _id: id }, { name }).populate('parts').populate('positionData')

    }

    @FieldResolver()
    id(@Root() dancer: any, @Ctx() ctx: any) {
        return dancer._id
    }
}

@Resolver(of => Control)
export class ControlResolver {
    @FieldResolver()
    async frame(@Root() control: any, @Ctx() ctx: any) {
        console.log(control.frame)
        let data = await ctx.db.ControlFrame.findOne({ _id: control.frame })
        return data
    }

    @FieldResolver()
    async status(@Root() control: any, @Ctx() ctx: any) {

        return control.value
    }
}

@Resolver(of => Position)
export class PositionResolver {
    @FieldResolver()
    async frame(@Root() position: Position, @Ctx() ctx: any) {
        console.log(position)
        let data = await ctx.db.PositionFrame.findOne({ _id: position.frame })
        return data
    }
}





