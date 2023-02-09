import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("LoggerMinAggregate", {
  isAbstract: true
})
export class LoggerMinAggregate {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id!: number | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  user!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  fieldName!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  time!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  status!: string | null;
}
