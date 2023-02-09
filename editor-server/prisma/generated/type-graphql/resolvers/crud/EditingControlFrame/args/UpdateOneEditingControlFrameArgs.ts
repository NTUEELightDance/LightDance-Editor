import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameUpdateInput } from "../../../inputs/EditingControlFrameUpdateInput";
import { EditingControlFrameWhereUniqueInput } from "../../../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameUpdateInput, {
    nullable: false
  })
  data!: EditingControlFrameUpdateInput;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingControlFrameWhereUniqueInput;
}
