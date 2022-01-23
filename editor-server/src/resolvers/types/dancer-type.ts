import { Field, ObjectType, Int, Float } from "type-graphql";
import { Part } from './part-type'

@ObjectType()
export class Dancer {
  @Field(type => String)
  name: string;

  @Field(type => [Part])
  parts: Part[]
}
