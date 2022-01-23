import { Field, ObjectType, Int, Float } from "type-graphql";
import { Control } from './control-type'

@ObjectType()
export class Part {
    @Field(type => String)
    name: string

    @Field(type => [Control])
    controlData: Control[]
}
