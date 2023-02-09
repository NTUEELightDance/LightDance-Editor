import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerWhereInput } from "../../../inputs/DancerWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyDancerArgs {
  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  where?: DancerWhereInput | undefined;
}
