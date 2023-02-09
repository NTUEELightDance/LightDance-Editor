import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataCreateInput } from "../../../inputs/EffectListDataCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataCreateInput, {
    nullable: false
  })
  data!: EffectListDataCreateInput;
}
