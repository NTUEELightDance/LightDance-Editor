import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameCreateInput } from "../../../inputs/ControlFrameCreateInput";
import { ControlFrameUpdateInput } from "../../../inputs/ControlFrameUpdateInput";
import { ControlFrameWhereUniqueInput } from "../../../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: ControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlFrameCreateInput, {
    nullable: false
  })
  create!: ControlFrameCreateInput;

  @TypeGraphQL.Field(_type => ControlFrameUpdateInput, {
    nullable: false
  })
  update!: ControlFrameUpdateInput;
}
