import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerUpdateManyMutationInput } from "../../../inputs/DancerUpdateManyMutationInput";
import { DancerWhereInput } from "../../../inputs/DancerWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyDancerArgs {
  @TypeGraphQL.Field(_type => DancerUpdateManyMutationInput, {
    nullable: false
  })
  data!: DancerUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  where?: DancerWhereInput | undefined;
}
