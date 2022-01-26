import { Field, ObjectType, Resolver, FieldResolver, Ctx, Float, Query, Root } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ControlFrame } from "./controlFrame";

@ObjectType()
export class ControlMapTest {
    @Field(type => ObjectIdScalar)
    id: string

    @Field(type => Float)
    start: number

    @Field(type => Boolean)
    fade: boolean

    @Field({ nullable: true })
    editing: string
}

export const ObjectIdScalar = new GraphQLScalarType({
    name: "ObjectId",
    description: "Mongo object id scalar type",
    serialize(value: any): any {
        // check the type of received value
        console.log(value)

        return value + "hello"; // value sent to the client
    },
    parseValue(value: unknown): any {
        // check the type of received value

        return value; // value from the client input variables
    },
    parseLiteral(ast: any): any {
        // check the type of received value

        return ast.value; // value from the client query
    },
})


@Resolver(of => ControlMapTest)
export class ControlMapTestResolver {
    @Query(returns => [ControlMapTest])
    async ControlMap(@Ctx() ctx: any) {
        let frames = await ctx.db.ControlFrame.find()
        return frames
    }
    @FieldResolver()
    async id(@Root() positionframe: any) {
        return positionframe._id
    }
}

