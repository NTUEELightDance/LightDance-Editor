import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameWhereUniqueInput } from "../../../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniquePositionFrameOrThrowArgs {
  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: PositionFrameWhereUniqueInput;
}
