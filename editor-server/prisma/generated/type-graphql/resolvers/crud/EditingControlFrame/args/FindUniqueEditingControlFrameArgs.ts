import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameWhereUniqueInput } from "../../../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingControlFrameWhereUniqueInput;
}
