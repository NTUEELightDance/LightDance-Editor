import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerUpdateInput } from "../../../inputs/DancerUpdateInput";
import { DancerWhereUniqueInput } from "../../../inputs/DancerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneDancerArgs {
  @TypeGraphQL.Field(_type => DancerUpdateInput, {
    nullable: false
  })
  data!: DancerUpdateInput;

  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: false
  })
  where!: DancerWhereUniqueInput;
}
