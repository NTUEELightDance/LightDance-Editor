import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerOrderByWithAggregationInput } from "../../../inputs/DancerOrderByWithAggregationInput";
import { DancerScalarWhereWithAggregatesInput } from "../../../inputs/DancerScalarWhereWithAggregatesInput";
import { DancerWhereInput } from "../../../inputs/DancerWhereInput";
import { DancerScalarFieldEnum } from "../../../../enums/DancerScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByDancerArgs {
  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  where?: DancerWhereInput | undefined;

  @TypeGraphQL.Field(_type => [DancerOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: DancerOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [DancerScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "name">;

  @TypeGraphQL.Field(_type => DancerScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: DancerScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
