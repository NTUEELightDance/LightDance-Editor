import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameCreateManyInput } from "../../../inputs/ControlFrameCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyControlFrameArgs {
  @TypeGraphQL.Field(_type => [ControlFrameCreateManyInput], {
    nullable: false
  })
  data!: ControlFrameCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
