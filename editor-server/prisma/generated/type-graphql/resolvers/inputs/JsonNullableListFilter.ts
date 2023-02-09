import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("JsonNullableListFilter", {
  isAbstract: true
})
export class JsonNullableListFilter {
  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  equals?: Prisma.InputJsonValue[] | undefined;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  has?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  hasEvery?: Prisma.InputJsonValue[] | undefined;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  hasSome?: Prisma.InputJsonValue[] | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  isEmpty?: boolean | undefined;
}
