import { Field, ObjectType, ID, Float } from "type-graphql";
import { Control } from './control'
import { ControlType } from "./controlType";


@ObjectType()
export class Part {
    @Field(type => String)
    name: string

    @Field(type => ControlType, { nullable: true })
    type: ControlType

    @Field(type => [Control])
    controlData: Control[]

    @Field(type => ID)
    id: string
}

