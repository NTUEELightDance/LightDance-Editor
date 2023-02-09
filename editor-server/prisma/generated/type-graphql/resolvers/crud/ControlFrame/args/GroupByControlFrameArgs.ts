import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameOrderByWithAggregationInput } from "../../../inputs/ControlFrameOrderByWithAggregationInput";
import { ControlFrameScalarWhereWithAggregatesInput } from "../../../inputs/ControlFrameScalarWhereWithAggregatesInput";
import { ControlFrameWhereInput } from "../../../inputs/ControlFrameWhereInput";
import { ControlFrameScalarFieldEnum } from "../../../../enums/ControlFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  where?: ControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ControlFrameOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "start" | "fade">;

  @TypeGraphQL.Field(_type => ControlFrameScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ControlFrameScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
