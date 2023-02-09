import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerCreateManyInput } from "../../../inputs/LoggerCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyLoggerArgs {
  @TypeGraphQL.Field(_type => [LoggerCreateManyInput], {
    nullable: false
  })
  data!: LoggerCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
