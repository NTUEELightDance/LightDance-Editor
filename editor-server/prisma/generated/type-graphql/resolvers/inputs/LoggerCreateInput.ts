import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("LoggerCreateInput", {
  isAbstract: true
})
export class LoggerCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  user!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  variableValue?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  fieldName!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  time?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  status!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  errorMessage?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  result?: Prisma.InputJsonValue | undefined;
}
