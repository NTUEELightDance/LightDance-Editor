import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class ColorPayload {
  @Field()
  mutation: colorMutation;

  @Field((type) => Int)
  editBy: number;

  @Field()
  color: string;

  @Field({ nullable: true })
  colorCode?: string;

  @Field({ nullable: true })
  renameColor?: string;
}

export enum colorMutation {
  RENAMED = "RENAMED",
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}
