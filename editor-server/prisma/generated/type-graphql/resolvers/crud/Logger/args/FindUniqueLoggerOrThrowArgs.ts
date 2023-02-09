import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerWhereUniqueInput } from "../../../inputs/LoggerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueLoggerOrThrowArgs {
  @TypeGraphQL.Field(_type => LoggerWhereUniqueInput, {
    nullable: false
  })
  where!: LoggerWhereUniqueInput;
}
