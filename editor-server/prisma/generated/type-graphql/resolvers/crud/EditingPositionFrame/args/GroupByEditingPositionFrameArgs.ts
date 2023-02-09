import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameOrderByWithAggregationInput } from "../../../inputs/EditingPositionFrameOrderByWithAggregationInput";
import { EditingPositionFrameScalarWhereWithAggregatesInput } from "../../../inputs/EditingPositionFrameScalarWhereWithAggregatesInput";
import { EditingPositionFrameWhereInput } from "../../../inputs/EditingPositionFrameWhereInput";
import { EditingPositionFrameScalarFieldEnum } from "../../../../enums/EditingPositionFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  where?: EditingPositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: EditingPositionFrameOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"userId" | "frameId">;

  @TypeGraphQL.Field(_type => EditingPositionFrameScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: EditingPositionFrameScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
