import {ObjectType, Field, ID} from "type-graphql"
import {mutation} from "./mutation"

@ObjectType()
export class ColorPayload {
    @Field()
    mutation: mutation;

    @Field()
    color: string;

    @Field({nullable: true})
    colorCode?: string;
}

