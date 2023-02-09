import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataWhereInput } from "../../../inputs/PositionDataWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyPositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  where?: PositionDataWhereInput | undefined;
}
