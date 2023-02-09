import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameUpdateManyMutationInput } from "../../../inputs/EditingControlFrameUpdateManyMutationInput";
import { EditingControlFrameWhereInput } from "../../../inputs/EditingControlFrameWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameUpdateManyMutationInput, {
    nullable: false
  })
  data!: EditingControlFrameUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  where?: EditingControlFrameWhereInput | undefined;
}
