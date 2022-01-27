import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class RequestEditResponse {
    @Field(type => String)
    editing: string

    @Field(type => Boolean)
    ok: boolean
}
