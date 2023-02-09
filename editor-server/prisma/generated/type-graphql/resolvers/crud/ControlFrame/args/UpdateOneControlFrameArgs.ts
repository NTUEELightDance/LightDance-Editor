import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameUpdateInput } from "../../../inputs/ControlFrameUpdateInput";
import { ControlFrameWhereUniqueInput } from "../../../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameUpdateInput, {
    nullable: false
  })
  data!: ControlFrameUpdateInput;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: ControlFrameWhereUniqueInput;
}
