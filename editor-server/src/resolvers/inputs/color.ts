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
  color: string;

  @Field()
  colorCode: string;

  @Field()
  id: string;
}
