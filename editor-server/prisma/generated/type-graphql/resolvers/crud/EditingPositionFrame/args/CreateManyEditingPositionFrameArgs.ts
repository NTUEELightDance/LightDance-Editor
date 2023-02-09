import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameCreateManyInput } from "../../../inputs/EditingPositionFrameCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => [EditingPositionFrameCreateManyInput], {
    nullable: false
  })
  data!: EditingPositionFrameCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
