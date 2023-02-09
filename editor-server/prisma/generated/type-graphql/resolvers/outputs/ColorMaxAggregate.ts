import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("ColorMaxAggregate", {
  isAbstract: true
})
export class ColorMaxAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  color!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  colorCode!: string | null;
}
