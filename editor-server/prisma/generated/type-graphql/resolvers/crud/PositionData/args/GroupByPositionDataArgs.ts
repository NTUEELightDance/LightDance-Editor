import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataOrderByWithAggregationInput } from "../../../inputs/PositionDataOrderByWithAggregationInput";
import { PositionDataScalarWhereWithAggregatesInput } from "../../../inputs/PositionDataScalarWhereWithAggregatesInput";
import { PositionDataWhereInput } from "../../../inputs/PositionDataWhereInput";
import { PositionDataScalarFieldEnum } from "../../../../enums/PositionDataScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByPositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  where?: PositionDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PositionDataOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: PositionDataOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"dancerId" | "frameId" | "x" | "y" | "z">;

  @TypeGraphQL.Field(_type => PositionDataScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: PositionDataScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
