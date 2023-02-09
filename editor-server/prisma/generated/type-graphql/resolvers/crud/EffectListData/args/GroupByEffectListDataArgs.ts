import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataOrderByWithAggregationInput } from "../../../inputs/EffectListDataOrderByWithAggregationInput";
import { EffectListDataScalarWhereWithAggregatesInput } from "../../../inputs/EffectListDataScalarWhereWithAggregatesInput";
import { EffectListDataWhereInput } from "../../../inputs/EffectListDataWhereInput";
import { EffectListDataScalarFieldEnum } from "../../../../enums/EffectListDataScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereInput, {
    nullable: true
  })
  where?: EffectListDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: EffectListDataOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "start" | "end" | "description" | "dancerData" | "controlFrames" | "positionFrames">;

  @TypeGraphQL.Field(_type => EffectListDataScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: EffectListDataScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
