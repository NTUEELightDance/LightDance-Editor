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
    @Field(type => ControlMapScalar)
    frames: ObjectId[]
}

export const ControlMapScalar = new GraphQLScalarType({
    name: "ControlMapQueryObjectId",
    description: "Mongo object id scalar type",
    async serialize(value: any): Promise<any> {
        // check the type of received value
        const result: LooseObject = {}
        const dancers = await db.Dancer.find()
        await Promise.all(
            value.map(async (data: any) => {
                const { _id, id } = data
                // const frameID = new ObjectId(id)
                const { fade, start, editing } = await db.ControlFrame.findById(_id)
                const status: LooseObject = {}
                await Promise.all(
                    dancers.map(async (dancer: any) => {

                        const { name, parts } = await db.Dancer.findById(dancer._id)
                        const partData: LooseObject = {}
                        await Promise.all(
                            parts.map(async (partID: any) => {
                                const { name, type, controlData } = await db.Part.findById(partID).populate("controlData")
                                const wanted = controlData.filter((data: any) => data.frame.toString() === _id.toString())
                                if (type === "LED") {
                                    partData[name] = wanted[0].value
                                } else if (type === "FIBER") {
                                    partData[name] = wanted[0].value
                                    const { colorCode } = await db.Color.findOne({ color: partData[name].color })
                                    partData[name].color = colorCode
                                } else {
                                    partData[name] = wanted[0].value.value
                                }
                            })
                        )
                        status[name] = partData
                    })
                )
                result[id] = { fade, start, editing, status }
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




