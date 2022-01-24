import { InputType, Field } from "type-graphql";

@InputType()
export class AddDancerInput {
    @Field()
    name: string

    // @Field()
    // parts: string[]

    // @Field()
    // partType: string
}