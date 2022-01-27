import { Field, ObjectType, Resolver, FieldResolver, Ctx, Float, Query, Root } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models"
import { ControlFrame } from "./controlFrame";

interface LooseObject {
    [key: string]: any
}

@ObjectType()
export class ControlMap {
    @Field(type => ObjectIdScalar)
    frames: ObjectId[]
}

export const ObjectIdScalar = new GraphQLScalarType({
    name: "ControlMapQueryObjectId",
    description: "Mongo object id scalar type",
    async serialize(value: any): Promise<any> {
        // check the type of received value
        const result: LooseObject = {}
        await Promise.all(
            value.map(async(id: string)=> {
                result[id] = await db.ControlFrame.findById(id)
            })
        )
        return result; // value sent to the client
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




