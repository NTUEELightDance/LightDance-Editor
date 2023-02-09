import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";

@TypeGraphQL.ObjectType("Logger", {
  isAbstract: true
})
export class Logger {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  user!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  variableValue?: Prisma.JsonValue | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  fieldName!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  time!: Date;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  status!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  errorMessage?: Prisma.JsonValue | null;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  result?: Prisma.JsonValue | null;
}
