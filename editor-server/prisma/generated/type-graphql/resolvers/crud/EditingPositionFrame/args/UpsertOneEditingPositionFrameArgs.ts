import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameCreateInput } from "../../../inputs/EditingPositionFrameCreateInput";
import { EditingPositionFrameUpdateInput } from "../../../inputs/EditingPositionFrameUpdateInput";
import { EditingPositionFrameWhereUniqueInput } from "../../../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingPositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateInput, {
    nullable: false
  })
  create!: EditingPositionFrameCreateInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateInput, {
    nullable: false
  })
  update!: EditingPositionFrameUpdateInput;
}
