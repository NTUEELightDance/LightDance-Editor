import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartCreateInput } from "../../../inputs/PartCreateInput";
import { PartUpdateInput } from "../../../inputs/PartUpdateInput";
import { PartWhereUniqueInput } from "../../../inputs/PartWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOnePartArgs {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;

  @TypeGraphQL.Field(_type => PartCreateInput, {
    nullable: false
  })
  create!: PartCreateInput;

  @TypeGraphQL.Field(_type => PartUpdateInput, {
    nullable: false
  })
  update!: PartUpdateInput;
}
