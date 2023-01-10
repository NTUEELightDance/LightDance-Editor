import { Field, ObjectType, Int, Float } from "type-graphql";
import { PositionFrame } from "./positionFrame";

@ObjectType()
export class Position {
  @Field((type) => PositionFrame)
    frame: PositionFrame;

  @Field((type) => Float)
    x: number;

  @Field((type) => Float)
    y: number;

  @Field((type) => Float)
    z: number;
}
