import { Field, ObjectType, Resolver, FieldResolver, Ctx, Float, Query, Root } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models"

interface LooseObject {
    [key: string]: any
}

@ObjectType()
export class PosMap {
    @Field(type => PositionMapScalar)
    frames: ObjectId[]
}

export const PositionMapScalar = new GraphQLScalarType({
    name: "PositionMapQueryObjectId",
    description: "Mongo object id scalar type",
    async serialize(value: any): Promise<any> {
        // check the type of received value
        const result: LooseObject = {}
        const dancers = await db.Dancer.find()
        await Promise.all(
            value.map(async (data: any) => {
                const { _id, id } = data
                // const frameID = new ObjectId(id)
                const { start, editing } = await db.PositionFrame.findById(_id)
                const pos: LooseObject = {}
                await Promise.all(
                    dancers.map(async (dancer: any) => {

                        const { name, positionData } = await db.Dancer.findById(dancer._id).populate("positionData")
                        const partData: LooseObject = {}
                        const wanted = positionData.filter((data: any) => data.frame.toString() === _id.toString())
                        pos[name] = { x: wanted[0].x, y: wanted[0].y, z: wanted[0].z }
                    })
                )
                result[id] = { start, editing, pos }
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




