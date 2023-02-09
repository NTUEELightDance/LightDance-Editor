import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameWhereUniqueInput } from "../../../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: ControlFrameWhereUniqueInput;
}
