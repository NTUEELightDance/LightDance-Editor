import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class ControlFrame {
    @Field(type => Float)
    start: number

    @Field(type => Boolean)
    fade: boolean
}
