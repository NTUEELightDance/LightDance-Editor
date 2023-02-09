import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataWhereUniqueInput } from "../../../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;
}
