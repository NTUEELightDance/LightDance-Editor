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
  @Field((type) => ID)
    id: string;

  @Field()
    name: string;

  @Field()
    type: ControlType;

  @Field()
    dancerName: string;
}

@InputType()
export class DeletePartInput {
  @Field((type) => ID)
    id: string;

  @Field()
    dancerName: string;
}
