import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataUpdateManyMutationInput } from "../../../inputs/EffectListDataUpdateManyMutationInput";
import { EffectListDataWhereInput } from "../../../inputs/EffectListDataWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataUpdateManyMutationInput, {
    nullable: false
  })
  data!: EffectListDataUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => EffectListDataWhereInput, {
    nullable: true
  })
  where?: EffectListDataWhereInput | undefined;
}
