import { InputType, Field, ObjectType, ID } from "type-graphql";

@InputType()
export class ControlDataInput {
  @Field()
    partName: string;

  @Field({ nullable: true })
    color: string;

  @Field({ nullable: true })
    alpha: number;

  @Field({ nullable: true })
    src: string;

  @Field({ nullable: true })
    ELValue: number;
}

@InputType()
export class EditControlInput {
  @Field()
    dancerName: string;

  @Field((type) => [ControlDataInput])
    controlData: ControlDataInput[];
}

