import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.ObjectType("ControlFrameMaxAggregate", {
  isAbstract: true
})
export class ControlFrameMaxAggregate {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id!: number | null;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  start!: number | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  fade!: boolean | null;
}
