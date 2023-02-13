import { InputType, Field, Int, Float } from "type-graphql";

@InputType()
export class queryMapInput {
  @Field(() => [Int])
  frameIds: number[];
}

@InputType()
export class EditControlMapInput {
  @Field(() => Int)
  frameId: number;
  @Field({ nullable: true })
  fade?: boolean;
  @Field(() => [[[String]]])
  controlData: string[][][];
}

@InputType()
export class EditPositionMapInput {
  @Field(() => Int)
  frameId: number;
  @Field(() => [[Float]])
  positionData: number[][];
}
