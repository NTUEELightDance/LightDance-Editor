import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerWhereUniqueInput } from "../../../inputs/DancerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneDancerArgs {
  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: false
  })
  where!: DancerWhereUniqueInput;
}
