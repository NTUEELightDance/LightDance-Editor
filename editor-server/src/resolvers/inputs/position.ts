import { InputType, Field, ObjectType, ID } from "type-graphql";

@InputType()
export class EditPositionInput {
  @Field()
    dancerName: string;

  @Field((type) => PositionDataInput)
    positionData: any;
}

@InputType()
class PositionDataInput {
  @Field()
    x: number;

  @Field()
    y: number;

  @Field()
    z: number;
}
