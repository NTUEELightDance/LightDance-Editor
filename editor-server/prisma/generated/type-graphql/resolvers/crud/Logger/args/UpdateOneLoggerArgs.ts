import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerUpdateInput } from "../../../inputs/LoggerUpdateInput";
import { LoggerWhereUniqueInput } from "../../../inputs/LoggerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerUpdateInput, {
    nullable: false
  })
  data!: LoggerUpdateInput;

  @TypeGraphQL.Field(_type => LoggerWhereUniqueInput, {
    nullable: false
  })
  where!: LoggerWhereUniqueInput;
}
