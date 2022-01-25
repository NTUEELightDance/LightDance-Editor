import { InputType, Field } from "type-graphql";
import { ControlType } from "../types/controlType";

@InputType()
export class AddPartInput {
    @Field()
    name: string

    @Field()
    type: ControlType

    @Field()
    dancerName: string

}