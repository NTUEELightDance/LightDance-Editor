import {InputType, Field} from 'type-graphql';

@InputType()
export class EditControlFrameInput{
  @Field()
  id: string;

  @Field()
  user: string;

  @Field()
  start: number;

  @Field()
  fade: boolean;
}
