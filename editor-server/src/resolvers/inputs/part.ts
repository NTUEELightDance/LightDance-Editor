import { InputType, Field, ID } from "type-graphql";
import { ControlType } from "../types/controlType";

@InputType()
export class AddPartInput {
  @Field()
    name: string;

  @Field()
    type: ControlType;

  @Field()
    dancerName: string;
}

@InputType()
export class EditPartInput {
  @Field((type) => Number)
    id: number;

  @Field()
    name: string;

  @Field()
    type: ControlType;
}

@InputType()
export class DeletePartInput {
  @Field((type) => Number)
    id: number;
}