import { InputType, Field } from "type-graphql";

@InputType()
export class ColorInput {
    @Field()
    color: string;

    @Field()
    colorCode: string
}