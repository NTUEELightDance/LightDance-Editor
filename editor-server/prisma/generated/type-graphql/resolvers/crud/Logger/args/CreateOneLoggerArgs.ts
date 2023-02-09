import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerCreateInput } from "../../../inputs/LoggerCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerCreateInput, {
    nullable: false
  })
  data!: LoggerCreateInput;
}
