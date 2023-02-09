import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartUpdateInput } from "../../../inputs/PartUpdateInput";
import { PartWhereUniqueInput } from "../../../inputs/PartWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOnePartArgs {
  @TypeGraphQL.Field(_type => PartUpdateInput, {
    nullable: false
  })
  data!: PartUpdateInput;

  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;
}
