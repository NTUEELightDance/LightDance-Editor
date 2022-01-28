import {InputType, Field} from 'type-graphql';

@InputType()
export class EditPositionFrameInput{
  @Field()
  id: string;

  @Field()
  user: string;

  @Field()
  start: number;
}
