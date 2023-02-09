import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("ControlFrameCreateManyInput", {
  isAbstract: true
})
export class ControlFrameCreateManyInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  fade!: boolean;
}
