import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataWhereUniqueInput } from "../../../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniquePositionDataOrThrowArgs {
  @TypeGraphQL.Field(_type => PositionDataWhereUniqueInput, {
    nullable: false
  })
  where!: PositionDataWhereUniqueInput;
}
