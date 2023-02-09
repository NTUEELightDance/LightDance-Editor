import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameWhereInput } from "../../../inputs/EditingPositionFrameWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  where?: EditingPositionFrameWhereInput | undefined;
}
