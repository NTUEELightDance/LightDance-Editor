import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameCreateInput } from "../../../inputs/PositionFrameCreateInput";
import { PositionFrameUpdateInput } from "../../../inputs/PositionFrameUpdateInput";
import { PositionFrameWhereUniqueInput } from "../../../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOnePositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: PositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionFrameCreateInput, {
    nullable: false
  })
  create!: PositionFrameCreateInput;

  @TypeGraphQL.Field(_type => PositionFrameUpdateInput, {
    nullable: false
  })
  update!: PositionFrameUpdateInput;
}
