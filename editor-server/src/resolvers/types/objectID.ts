import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import { Dancer } from "./dancer";
import db from "../../models"

export const ObjectIdScalar = new GraphQLScalarType({
    name: "ObjectId",
    description: "Mongo object id scalar type",
    serialize(value: any): any {
        // check the type of received value
        console.log(value)

        return db.Dancer.findById(value); // value sent to the client
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