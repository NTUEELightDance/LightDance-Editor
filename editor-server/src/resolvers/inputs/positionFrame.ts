import { InputType, Field } from 'type-graphql';

@InputType()
export class EditPositionFrameInput {
  @Field()
  id: string;

  @Field()
  start: number;
}

@InputType()
export class DeletePositionFrameInput {
  @Field()
  id: string;
}
