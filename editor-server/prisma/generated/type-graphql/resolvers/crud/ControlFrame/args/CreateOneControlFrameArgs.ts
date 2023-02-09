import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameCreateInput } from "../../../inputs/ControlFrameCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameCreateInput, {
    nullable: false
  })
  data!: ControlFrameCreateInput;
}
