import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class ColorPayload {
  @Field()
  mutation: colorMutation;

  @Field((type) => Int)
  editBy: number;

  @Field((type) => Int)
  id: number;

  @Field({ nullable: true })
  color?: string;

  @Field((type) => [Int], { nullable: true })
  colorCode?: number[];
}

export enum colorMutation {
  UPDATED = "UPDATED",
  CREATED = "CREATED",
  DELETED = "DELETED",
}
