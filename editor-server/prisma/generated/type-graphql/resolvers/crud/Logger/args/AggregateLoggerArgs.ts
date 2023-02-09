import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LoggerOrderByWithRelationInput } from "../../../inputs/LoggerOrderByWithRelationInput";
import { LoggerWhereInput } from "../../../inputs/LoggerWhereInput";
import { LoggerWhereUniqueInput } from "../../../inputs/LoggerWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateLoggerArgs {
  @TypeGraphQL.Field(_type => LoggerWhereInput, {
    nullable: true
  })
  where?: LoggerWhereInput | undefined;

  @TypeGraphQL.Field(_type => [LoggerOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: LoggerOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => LoggerWhereUniqueInput, {
    nullable: true
  })
  cursor?: LoggerWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
