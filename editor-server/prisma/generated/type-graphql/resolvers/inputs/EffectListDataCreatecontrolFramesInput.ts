import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("EffectListDataCreatecontrolFramesInput", {
  isAbstract: true
})
export class EffectListDataCreatecontrolFramesInput {
  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: false
  })
  set!: Prisma.InputJsonValue[];
}
