// todo
// extend dancer, {ok, msg}
import { Field, ObjectType } from "type-graphql";
import { Dancer } from "../../../prisma/generated/type-graphql";

@ObjectType()
export class DancerResponse {
  @Field((type) => Boolean)
    ok: boolean;

  @Field((type) => String, { nullable: true })
    msg: string;
  @Field((type) => Dancer, { nullable: true })
    dancerData?: Dancer;
}
