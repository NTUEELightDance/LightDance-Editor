import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataUpdateManyMutationInput } from "../../../inputs/ControlDataUpdateManyMutationInput";
import { ControlDataWhereInput } from "../../../inputs/ControlDataWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataUpdateManyMutationInput, {
    nullable: false
  })
  data!: ControlDataUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  where?: ControlDataWhereInput | undefined;
}
