import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataUpdateManyMutationInput } from "../../../inputs/PositionDataUpdateManyMutationInput";
import { PositionDataWhereInput } from "../../../inputs/PositionDataWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyPositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataUpdateManyMutationInput, {
    nullable: false
  })
  data!: PositionDataUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  where?: PositionDataWhereInput | undefined;
}
