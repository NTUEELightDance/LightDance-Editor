import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectOrderByWithAggregationInput } from "../../../inputs/LEDEffectOrderByWithAggregationInput";
import { LEDEffectScalarWhereWithAggregatesInput } from "../../../inputs/LEDEffectScalarWhereWithAggregatesInput";
import { LEDEffectWhereInput } from "../../../inputs/LEDEffectWhereInput";
import { LEDEffectScalarFieldEnum } from "../../../../enums/LEDEffectScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByLEDEffectArgs {
  @TypeGraphQL.Field(_type => LEDEffectWhereInput, {
    nullable: true
  })
  where?: LEDEffectWhereInput | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: LEDEffectOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "name" | "partName" | "repeat" | "frames">;

  @TypeGraphQL.Field(_type => LEDEffectScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: LEDEffectScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
