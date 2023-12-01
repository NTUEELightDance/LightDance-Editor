import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class ColorResponse {
  @Field((type) => Int)
  id: number;

  @Field((type) => Boolean, { nullable: true })
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
