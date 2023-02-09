import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameOrderByWithAggregationInput } from "../../../inputs/PositionFrameOrderByWithAggregationInput";
import { PositionFrameScalarWhereWithAggregatesInput } from "../../../inputs/PositionFrameScalarWhereWithAggregatesInput";
import { PositionFrameWhereInput } from "../../../inputs/PositionFrameWhereInput";
import { PositionFrameScalarFieldEnum } from "../../../../enums/PositionFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByPositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  where?: PositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: PositionFrameOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "start">;

  @TypeGraphQL.Field(_type => PositionFrameScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: PositionFrameScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
