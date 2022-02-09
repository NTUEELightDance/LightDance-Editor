import { Field, ObjectType } from "type-graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";
import db from "../../models";

interface LooseObject {
  [key: string]: any;
}

@ObjectType()
export class PosData {
  @Field((type) => PosDataScalar)
  frame: ObjectId;
}

export const PosDataScalar = new GraphQLScalarType({
  name: "PosMapMutationObjectId",
  description: "Mongo object id scalar type",
  async serialize(data: any): Promise<any> {
    // check the type of received value
    const { _id, id } = data;
    const result: LooseObject = {};
    const allDancers = await db.Dancer.find().populate("positionData");
    // const frameID = new ObjectId(id)
    const { start, editing } = await db.PositionFrame.findById(_id);
    const pos: LooseObject = {};
    await Promise.all(
      allDancers.map(async (dancer: any) => {
        const { name, positionData } = dancer;
        const wanted = positionData.find(
          (data: any) => data.frame.toString() === _id.toString()
        );
        pos[name] = { x: wanted.x, y: wanted.y, z: wanted.z };
      })
    );
    result[id] = { start, editing, pos };
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
