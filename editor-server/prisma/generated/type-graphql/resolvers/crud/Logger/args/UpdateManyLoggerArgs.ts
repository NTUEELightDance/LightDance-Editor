import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerUpdateManyMutationInput } from "../../../inputs/LoggerUpdateManyMutationInput";
import { LoggerWhereInput } from "../../../inputs/LoggerWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerUpdateManyMutationInput, {
    nullable: false
  })
  data!: LoggerUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => LoggerWhereInput, {
    nullable: true
  })
  where?: LoggerWhereInput | undefined;
}
