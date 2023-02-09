import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameWhereInput } from "../../../inputs/EditingControlFrameWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  where?: EditingControlFrameWhereInput | undefined;
}
