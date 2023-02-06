import { type } from "os";
import { InputType, Field } from "type-graphql";

@InputType()
export class EditControlMapInput {
  @Field()
    startTime: number;
  @Field({ nullable: true })
    fade?: boolean;
  @Field(type=>[[[String]]])
    controlData: string[][][];
}
