import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("EffectListDataUpdatepositionFramesInput", {
  isAbstract: true
})
export class EffectListDataUpdatepositionFramesInput {
  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  set?: Prisma.InputJsonValue[] | undefined;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: true
  })
  push?: Prisma.InputJsonValue[] | undefined;
}
