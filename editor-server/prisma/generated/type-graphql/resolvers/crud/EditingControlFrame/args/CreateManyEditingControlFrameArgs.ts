import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameCreateManyInput } from "../../../inputs/EditingControlFrameCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => [EditingControlFrameCreateManyInput], {
    nullable: false
  })
  data!: EditingControlFrameCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
