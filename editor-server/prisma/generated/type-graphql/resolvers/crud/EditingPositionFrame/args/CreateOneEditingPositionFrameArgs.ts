import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameCreateInput } from "../../../inputs/EditingPositionFrameCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameCreateInput, {
    nullable: false
  })
  data!: EditingPositionFrameCreateInput;
}
