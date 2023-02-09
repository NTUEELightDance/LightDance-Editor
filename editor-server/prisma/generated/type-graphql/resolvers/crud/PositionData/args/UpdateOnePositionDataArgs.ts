import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataUpdateInput } from "../../../inputs/PositionDataUpdateInput";
import { PositionDataWhereUniqueInput } from "../../../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOnePositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataUpdateInput, {
    nullable: false
  })
  data!: PositionDataUpdateInput;

  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;
}
