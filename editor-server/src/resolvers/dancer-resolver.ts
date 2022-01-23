import {
    Resolver,
    Query,
    FieldResolver,
    Ctx,
    Root,
} from 'type-graphql';
import { Control } from './types/control-type';
import { Part } from './types/part-type';
import { Dancer } from './types/dancer-type';

@Resolver()
export class DancerResolver {
    @Query(returns => [Dancer])
    async dancer(@Ctx() ctx: any) {
        let dancers = await ctx.db.Dancer.find()
        return dancers
    }
}

// @Resolver(of => Dancer)
// export class DancerResolver {
//     @FieldResolver()
//     async parts(@Root() dancer: Dancer) {
//         let dancer_populated = await dancer.populate('parts')
//         return dancer_populated.parts
//     }
// }

@Resolver(of => Part)
export class PartResolver {
    @FieldResolver()
    async controlData(@Root() part: any, @Ctx() ctx: any) {
        console.log(part)
        let data = await ctx.db.Part.findOne({ _id: part })
        console.log(data)
        return data.controlData
    }
}

@Resolver(of => Control)
export class ControlResolver {
    @FieldResolver()
    async frame(@Root() control: any, @Ctx() ctx: any) {
        let data = await ctx.db.Control.findOne({ _id: control }).populate('frame')
        return data.frame
    }
    @FieldResolver()
    async type(@Root() control: any, @Ctx() ctx: any) {
        let data = await ctx.db.Control.findOne({ _id: control })
        return data.type
    }

    @FieldResolver()
    async status(@Root() control: any, @Ctx() ctx: any) {
        let data = await ctx.db.Control.findOne({ _id: control })
        console.log(data.value)
        return data.value
    }
}


