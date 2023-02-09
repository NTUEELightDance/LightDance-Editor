import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerCreateInput } from "../../../inputs/LoggerCreateInput";
import { LoggerUpdateInput } from "../../../inputs/LoggerUpdateInput";
import { LoggerWhereUniqueInput } from "../../../inputs/LoggerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerWhereUniqueInput, {
    nullable: false
  })
  where!: LoggerWhereUniqueInput;

  @TypeGraphQL.Field(_type => LoggerCreateInput, {
    nullable: false
  })
  create!: LoggerCreateInput;

  @TypeGraphQL.Field(_type => LoggerUpdateInput, {
    nullable: false
  })
  update!: LoggerUpdateInput;
}
