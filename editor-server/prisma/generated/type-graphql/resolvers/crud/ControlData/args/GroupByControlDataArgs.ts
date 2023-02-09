import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataOrderByWithAggregationInput } from "../../../inputs/ControlDataOrderByWithAggregationInput";
import { ControlDataScalarWhereWithAggregatesInput } from "../../../inputs/ControlDataScalarWhereWithAggregatesInput";
import { ControlDataWhereInput } from "../../../inputs/ControlDataWhereInput";
import { ControlDataScalarFieldEnum } from "../../../../enums/ControlDataScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  where?: ControlDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ControlDataOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ControlDataOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"partId" | "frameId" | "value">;

  @TypeGraphQL.Field(_type => ControlDataScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ControlDataScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
