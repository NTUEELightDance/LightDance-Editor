import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataCreateInput } from "../../../inputs/PositionDataCreateInput";
import { PositionDataUpdateInput } from "../../../inputs/PositionDataUpdateInput";
import { PositionDataWhereUniqueInput } from "../../../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOnePositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => PositionDataCreateInput, {
    nullable: false
  })
  create!: PositionDataCreateInput;

  @TypeGraphQL.Field(_type => PositionDataUpdateInput, {
    nullable: false
  })
  update!: PositionDataUpdateInput;
}
