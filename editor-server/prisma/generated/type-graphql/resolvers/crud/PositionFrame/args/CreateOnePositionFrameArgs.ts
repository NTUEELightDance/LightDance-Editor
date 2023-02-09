import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameCreateInput } from "../../../inputs/PositionFrameCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOnePositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameCreateInput, {
    nullable: false
  })
  data!: PositionFrameCreateInput;
}
