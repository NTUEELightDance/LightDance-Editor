import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerCreateInput } from "../../../inputs/DancerCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneDancerArgs {
  @TypeGraphQL.Field(_type => DancerCreateInput, {
    nullable: false
  })
  data!: DancerCreateInput;
}
