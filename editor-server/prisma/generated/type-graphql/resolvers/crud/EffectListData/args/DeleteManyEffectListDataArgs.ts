import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EffectListDataWhereInput } from "../../../inputs/EffectListDataWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyEffectListDataArgs {
  @TypeGraphQL.Field(_type => EffectListDataWhereInput, {
    nullable: true
  })
  where?: EffectListDataWhereInput | undefined;
}
