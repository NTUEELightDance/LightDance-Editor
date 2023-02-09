import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameUpdateInput } from "../../../inputs/PositionFrameUpdateInput";
import { PositionFrameWhereUniqueInput } from "../../../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOnePositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameUpdateInput, {
    nullable: false
  })
  data!: PositionFrameUpdateInput;

  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: PositionFrameWhereUniqueInput;
}
