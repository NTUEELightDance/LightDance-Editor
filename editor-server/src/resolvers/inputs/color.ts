import { InputType, Field } from "type-graphql";

@InputType()
export class ColorInput {
  @Field()
    color: string;

  @Field()
    colorCode: string;
}

@InputType()
export class addColorInput {
  @Field()
    color: string;

  @Field()
    colorCode: string;
}

@InputType()
export class editColorInput {
  @Field()
    original_color: string;

  @Field()
    colorCode: string;

  @Field()
    new_color: string;
}
