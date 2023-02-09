import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameWhereInput } from "../../../inputs/ControlFrameWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  where?: ControlFrameWhereInput | undefined;
}
