import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class ColorResponse {
  @Field((type) => String)
  color: string;

  @Field((type) => String)
  colorCode: string;

  @Field((type) => Boolean, { nullable: true })
  ok: boolean;

  @Field((type) => String, { nullable: true })
  msg: string;
}
