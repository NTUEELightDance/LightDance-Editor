import { Field, ObjectType } from "type-graphql";
import { Part } from "../types/part";

@ObjectType()
export class PartResponse extends Part {
  @Field((type) => Boolean)
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
