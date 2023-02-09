import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameWhereUniqueInput } from "../../../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingPositionFrameWhereUniqueInput;
}
