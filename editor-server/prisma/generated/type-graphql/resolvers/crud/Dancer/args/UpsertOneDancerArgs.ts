import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerCreateInput } from "../../../inputs/DancerCreateInput";
import { DancerUpdateInput } from "../../../inputs/DancerUpdateInput";
import { DancerWhereUniqueInput } from "../../../inputs/DancerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneDancerArgs {
  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: false
  })
  where!: DancerWhereUniqueInput;

  @TypeGraphQL.Field(_type => DancerCreateInput, {
    nullable: false
  })
  create!: DancerCreateInput;

  @TypeGraphQL.Field(_type => DancerUpdateInput, {
    nullable: false
  })
  update!: DancerUpdateInput;
}
