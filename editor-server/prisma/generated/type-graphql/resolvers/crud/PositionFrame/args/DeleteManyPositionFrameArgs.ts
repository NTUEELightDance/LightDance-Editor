import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameWhereInput } from "../../../inputs/PositionFrameWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyPositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  where?: PositionFrameWhereInput | undefined;
}
