import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataOrderByWithRelationInput } from "../../../inputs/EffectListDataOrderByWithRelationInput";
import { EffectListDataWhereInput } from "../../../inputs/EffectListDataWhereInput";
import { EffectListDataWhereUniqueInput } from "../../../inputs/EffectListDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereInput, {
    nullable: true
  })
  where?: EffectListDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: EffectListDataOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => EffectListDataWhereUniqueInput, {
    nullable: true
  })
  cursor?: EffectListDataWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
