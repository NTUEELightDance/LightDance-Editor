import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("ColorWhereUniqueInput", {
  isAbstract: true
})
export class ColorWhereUniqueInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  color?: string | undefined;
}
