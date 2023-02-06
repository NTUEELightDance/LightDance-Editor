import { Field, ObjectType } from "type-graphql";
import { Part } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class PartResponse {
  @Field((type) => Boolean)
    ok: boolean;

  @Field((type) => String, { nullable: true })
    msg: string;
  @Field((type) => Part, { nullable: true })
    partData?: Part;
}