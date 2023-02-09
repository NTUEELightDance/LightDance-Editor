import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameCreateInput } from "../../../inputs/EditingControlFrameCreateInput";
import { EditingControlFrameUpdateInput } from "../../../inputs/EditingControlFrameUpdateInput";
import { EditingControlFrameWhereUniqueInput } from "../../../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateInput, {
    nullable: false
  })
  create!: EditingControlFrameCreateInput;

  @TypeGraphQL.Field(_type => EditingControlFrameUpdateInput, {
    nullable: false
  })
  update!: EditingControlFrameUpdateInput;
}
