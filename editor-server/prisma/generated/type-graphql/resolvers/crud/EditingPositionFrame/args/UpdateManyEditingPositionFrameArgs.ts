import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameUpdateManyMutationInput } from "../../../inputs/EditingPositionFrameUpdateManyMutationInput";
import { EditingPositionFrameWhereInput } from "../../../inputs/EditingPositionFrameWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyEditingPositionFrameArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateManyMutationInput, {
    nullable: false
  })
  data!: EditingPositionFrameUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  where?: EditingPositionFrameWhereInput | undefined;
}
