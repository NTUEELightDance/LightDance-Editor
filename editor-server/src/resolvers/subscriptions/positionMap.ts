import {ObjectType, Field, ID} from "type-graphql"
import { ObjectId } from "mongodb";
import { PositionMapScalar } from "../types/positionMap";

@ObjectType()
export class PositionMapPayload {
    @Field()
    mutation: PositionMapMutation;

    @Field(type => PositionMapScalar, {nullable: true})
    frames?: any[]   

    @Field()
    frameID: string
    
    @Field()
    editBy: string; 
}

export enum PositionMapMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED"
}

