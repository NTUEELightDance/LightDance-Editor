import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataCreateManyInput } from "../../../inputs/EffectListDataCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyEffectListDataArgs {
  @TypeGraphQL.Field(_type => [EffectListDataCreateManyInput], {
    nullable: false
  })
  data!: EffectListDataCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
