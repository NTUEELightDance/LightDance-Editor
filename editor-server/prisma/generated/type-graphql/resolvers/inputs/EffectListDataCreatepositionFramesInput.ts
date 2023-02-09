import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("EffectListDataCreatepositionFramesInput", {
  isAbstract: true
})
export class EffectListDataCreatepositionFramesInput {
  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: false
  })
  set!: Prisma.InputJsonValue[];
}
