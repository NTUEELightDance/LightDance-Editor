import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameUpdateManyMutationInput } from "../../../inputs/ControlFrameUpdateManyMutationInput";
import { ControlFrameWhereInput } from "../../../inputs/ControlFrameWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameUpdateManyMutationInput, {
    nullable: false
  })
  data!: ControlFrameUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  where?: ControlFrameWhereInput | undefined;
}
