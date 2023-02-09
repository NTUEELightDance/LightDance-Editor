import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorUpdateManyMutationInput } from "../../../inputs/ColorUpdateManyMutationInput";
import { ColorWhereInput } from "../../../inputs/ColorWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyColorArgs {
  @TypeGraphQL.Field(_type => ColorUpdateManyMutationInput, {
    nullable: false
  })
  data!: ColorUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => ColorWhereInput, {
    nullable: true
  })
  where?: ColorWhereInput | undefined;
}
