import {ObjectType, Field, ID} from "type-graphql"

@ObjectType()
export class ControlMapPayload {
    @Field()
    mutation: ControlMapMutation;

    
}

export enum ControlMapMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED"
}

