import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerWhereInput } from "../../../inputs/LoggerWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerWhereInput, {
    nullable: true
  })
  where?: LoggerWhereInput | undefined;
}
