import {
  Field,
  ObjectType,
} from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class ControlMap {
  @Field((type) => ControlMapScalar)
  frames: ObjectId[];
}

export const ControlMapScalar = new GraphQLScalarType({
  name: "ControlMapQueryObjectId",
  description: "Mongo object id scalar type",
  async serialize(value: any): Promise<any> {
    // check the type of received value
    const time = Date.now()
    const result: LooseObject = {};
    const allDancers = await db.Dancer.find().populate({
      path: "parts",
      populate: {
        path: "controlData"
      }
    });
    console.log(Date.now() - time)
    await Promise.all(
      value.map(async (data: any) => {
        const { _id, id } = data;
        // const frameID = new ObjectId(id)
        const { fade, start, editing } = await db.ControlFrame.findById(_id);
        const status: LooseObject = {};
        await Promise.all(
          allDancers.map(async (dancer: any) => {
            const { name, parts } = dancer;
            const partData: LooseObject = {};
            await Promise.all(
              parts.map(async (part: any) => {
                const { name, type, controlData } = part
                const wanted = controlData.find(
                  (data: any) => data.frame.toString() === _id.toString()
                );
                if (!wanted) throw new Error(`ControlData ${_id} not found`)
                const { value } = wanted
                if (type === "LED") {
                  partData[name] = value;
                } else if (type === "FIBER") {
                  partData[name] = value;
                  const { colorCode } = await db.Color.findOne({
                    color: partData[name].color,
                  });
                  partData[name].color = colorCode;
                } else {
                  partData[name] = value.value;
                }
              })
            );
            status[name] = partData;
          })
        );
        result[id] = { fade, start, editing, status };
      })
    );

    console.log(Date.now() - time)
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
});
