import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartOrderByWithAggregationInput } from "../../../inputs/PartOrderByWithAggregationInput";
import { PartScalarWhereWithAggregatesInput } from "../../../inputs/PartScalarWhereWithAggregatesInput";
import { PartWhereInput } from "../../../inputs/PartWhereInput";
import { PartScalarFieldEnum } from "../../../../enums/PartScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByPartArgs {
  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  where?: PartWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PartOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: PartOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "dancerId" | "name" | "type">;

  @TypeGraphQL.Field(_type => PartScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: PartScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
