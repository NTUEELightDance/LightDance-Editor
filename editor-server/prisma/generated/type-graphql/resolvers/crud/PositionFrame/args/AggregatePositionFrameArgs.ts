import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameOrderByWithRelationInput } from "../../../inputs/PositionFrameOrderByWithRelationInput";
import { PositionFrameWhereInput } from "../../../inputs/PositionFrameWhereInput";
import { PositionFrameWhereUniqueInput } from "../../../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregatePositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  where?: PositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PositionFrameOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: PositionFrameOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: true
  })
  cursor?: PositionFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
