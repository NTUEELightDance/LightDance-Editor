import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("ColorCreateManyInput", {
  isAbstract: true
})
export class ColorCreateManyInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  color!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  colorCode!: string;
}
