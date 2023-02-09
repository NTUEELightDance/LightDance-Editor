import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameCreateInput } from "../../../inputs/EditingControlFrameCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameCreateInput, {
    nullable: false
  })
  data!: EditingControlFrameCreateInput;
}
