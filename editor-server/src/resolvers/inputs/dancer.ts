import { InputType, Field, ObjectType, ID } from "type-graphql";
import { Part } from "../types/part";
import { ControlType } from "../types/controlType";
import { Control } from "../types/control";

// @InputType()
// export class AddPartForDancer implements Partial<Part>{
//     @Field()
//     name: string

//     @Field()
//     type: ControlType
// }

@InputType()
export class AddDancerInput {
  @Field()
    name: string;
}

@InputType()
export class editDancerInput {
  @Field()
    name: string;

  @Field((type) => ID)
    id: number;
}

@InputType()
export class deleteDancerInput {
  @Field((type) => ID)
    id: number;
}
