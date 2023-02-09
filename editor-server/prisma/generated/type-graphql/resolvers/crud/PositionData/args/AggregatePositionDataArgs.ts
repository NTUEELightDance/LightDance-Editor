import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataOrderByWithRelationInput } from "../../../inputs/PositionDataOrderByWithRelationInput";
import { PositionDataWhereInput } from "../../../inputs/PositionDataWhereInput";
import { PositionDataWhereUniqueInput } from "../../../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregatePositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  where?: PositionDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PositionDataOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: PositionDataOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: true
  })
  cursor?: PositionDataWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
