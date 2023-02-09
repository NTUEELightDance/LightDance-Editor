import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartUpdateManyMutationInput } from "../../../inputs/PartUpdateManyMutationInput";
import { PartWhereInput } from "../../../inputs/PartWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyPartArgs {
  @TypeGraphQL.Field(_type => PartUpdateManyMutationInput, {
    nullable: false
  })
  data!: PartUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  where?: PartWhereInput | undefined;
}
