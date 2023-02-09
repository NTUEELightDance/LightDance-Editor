import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerOrderByWithRelationInput } from "../../../inputs/DancerOrderByWithRelationInput";
import { DancerWhereInput } from "../../../inputs/DancerWhereInput";
import { DancerWhereUniqueInput } from "../../../inputs/DancerWhereUniqueInput";
import { DancerScalarFieldEnum } from "../../../../enums/DancerScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindManyDancerArgs {
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

  @TypeGraphQL.Field(_type => [DancerScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "name"> | undefined;
}
