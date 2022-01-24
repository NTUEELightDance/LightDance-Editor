import { InputType, Field } from "type-graphql";

@InputType()
export class AddPartInput {
    @Field()
    name: string

    @Field()
    dancerName: string

}