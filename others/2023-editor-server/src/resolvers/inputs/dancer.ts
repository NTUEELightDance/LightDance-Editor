import { InputType, Field, ObjectType, ID, Int } from "type-graphql";
import { Part, ControlData } from "../../../prisma/generated/type-graphql";
import { ControlType } from "../types/controlType";

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

  @Field((type) => Int)
  id: number;
}

@InputType()
export class deleteDancerInput {
  @Field((type) => Int)
  id: number;
}
