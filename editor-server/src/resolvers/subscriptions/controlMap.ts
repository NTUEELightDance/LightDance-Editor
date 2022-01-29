import {ObjectType, Field, ID} from "type-graphql"
import { ObjectId } from "mongodb";
import { ControlMapScalar } from "../types/controlMap";

@ObjectType()
export class ControlMapPayload {
    @Field()
    mutation: ControlMapMutation;

    @Field(type => ControlMapScalar, {nullable: true})
    frames?: any[]   
    
    @Field()
    editBy: string; 
}

export enum ControlMapMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED"
}

