import { Field, ObjectType, ID, Float } from "type-graphql";
import { Part } from "./part";
import { Position } from "./position";

@ObjectType()
export class Dancer {
  @Field((type) => String)
    name: string;

  @Field((type) => [Part])
    parts: Part[];

  @Field((type) => [Position])
    positionData: Position[];

  @Field((type) => Number)
    id: number;
}
