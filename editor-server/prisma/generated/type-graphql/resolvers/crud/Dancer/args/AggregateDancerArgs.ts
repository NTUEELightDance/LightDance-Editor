import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerOrderByWithRelationInput } from "../../../inputs/DancerOrderByWithRelationInput";
import { DancerWhereInput } from "../../../inputs/DancerWhereInput";
import { DancerWhereUniqueInput } from "../../../inputs/DancerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateDancerArgs {
  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  where?: DancerWhereInput | undefined;

  @TypeGraphQL.Field(_type => [DancerOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: DancerOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: true
  })
  cursor?: DancerWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
