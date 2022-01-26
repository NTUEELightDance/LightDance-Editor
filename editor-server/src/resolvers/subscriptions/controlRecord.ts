import {ObjectType, Field, ID, Int} from "type-graphql"

@ObjectType()
export class ControlRecordPayload {
    @Field()
    mutation: controlRecordMutation;

    @Field(type => ID)
    frameID: string;
    
    @Field()
    editBy: string;

    @Field(type => Int)
    index: number;
}

export enum controlRecordMutation {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED"
}
