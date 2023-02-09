import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameUpdateInput } from "../../../inputs/EditingPositionFrameUpdateInput";
import { EditingPositionFrameWhereUniqueInput } from "../../../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateInput, {
    nullable: false
  })
  data!: EditingPositionFrameUpdateInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingPositionFrameWhereUniqueInput;
}
