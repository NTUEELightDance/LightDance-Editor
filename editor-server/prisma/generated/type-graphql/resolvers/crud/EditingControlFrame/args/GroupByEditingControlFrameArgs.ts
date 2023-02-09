import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameOrderByWithAggregationInput } from "../../../inputs/EditingControlFrameOrderByWithAggregationInput";
import { EditingControlFrameScalarWhereWithAggregatesInput } from "../../../inputs/EditingControlFrameScalarWhereWithAggregatesInput";
import { EditingControlFrameWhereInput } from "../../../inputs/EditingControlFrameWhereInput";
import { EditingControlFrameScalarFieldEnum } from "../../../../enums/EditingControlFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  where?: EditingControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: EditingControlFrameOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"userId" | "frameId">;

  @TypeGraphQL.Field(_type => EditingControlFrameScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: EditingControlFrameScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
