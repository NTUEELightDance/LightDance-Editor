import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameUpdateManyMutationInput } from "../../../inputs/PositionFrameUpdateManyMutationInput";
import { PositionFrameWhereInput } from "../../../inputs/PositionFrameWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyPositionFrameArgs {
  @TypeGraphQL.Field(_type => PositionFrameUpdateManyMutationInput, {
    nullable: false
  })
  data!: PositionFrameUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => PositionFrameWhereInput, {
    nullable: true
  })
  where?: PositionFrameWhereInput | undefined;
}
