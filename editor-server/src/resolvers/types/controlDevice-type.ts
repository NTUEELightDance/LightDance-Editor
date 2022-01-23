import { Field, ObjectType, Int, Float, ID } from "type-graphql";
import { createUnionType } from "type-graphql";

export const ControlDevice = createUnionType({
    name: "ControlDevice",
    types: () => [FIBER, LED, EL] as const,
    resolveType: value => {
        if ("color" in value) {
            return FIBER; // we can return object type class (the one with `@ObjectType()`)
        }
        if ("value" in value) {
            return EL; // or the schema name of the type as a string
        }
        if ("src" in value) {
            return LED
        }
        return undefined;
    },
})

@ObjectType()
class FIBER {


    @Field(type => String)
    color: string

    @Field(type => Float)
    alpha: number
}

@ObjectType()
class EL {


    @Field(type => Int)
    value: number
}

@ObjectType()
class LED {

    @Field(type => String)
    src: string

    @Field(type => Float)
    alpha: number
}