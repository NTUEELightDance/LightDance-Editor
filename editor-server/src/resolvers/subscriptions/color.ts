import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class ColorPayload {
  @Field()
  mutation: colorMutation;

  @Field()
  editBy: string;

  @Field()
  color: string;

  @Field({ nullable: true })
  colorCode?: string;
}

export enum colorMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}
