import { Field, ObjectType, Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { Control } from './control'
import { ControlType } from "./controlType";


@ObjectType()
export class Part {
    @Field(type => String)
    name: string

    @Field(type => ControlType)
    type: ControlType

    @Field(type => [Control])
    controlData: Control[]
}

@Resolver(of => Part)
export class PartResolver {
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