import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorOrderByWithAggregationInput } from "../../../inputs/ColorOrderByWithAggregationInput";
import { ColorScalarWhereWithAggregatesInput } from "../../../inputs/ColorScalarWhereWithAggregatesInput";
import { ColorWhereInput } from "../../../inputs/ColorWhereInput";
import { ColorScalarFieldEnum } from "../../../../enums/ColorScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByColorArgs {
  @TypeGraphQL.Field(_type => ColorWhereInput, {
    nullable: true
  })
  where?: ColorWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ColorOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ColorOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ColorScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"color" | "colorCode">;

  @TypeGraphQL.Field(_type => ColorScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ColorScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
