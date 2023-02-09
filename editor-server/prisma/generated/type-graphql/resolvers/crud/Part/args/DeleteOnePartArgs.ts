import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartWhereUniqueInput } from "../../../inputs/PartWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOnePartArgs {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;
}
