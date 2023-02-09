import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LEDEffectCreateframesInput } from "../inputs/LEDEffectCreateframesInput";

@TypeGraphQL.InputType("LEDEffectCreateManyInput", {
  isAbstract: true
})
export class LEDEffectCreateManyInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id?: number | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  partName!: string;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  repeat!: number;

  @TypeGraphQL.Field(_type => LEDEffectCreateframesInput, {
    nullable: true
  })
  frames?: LEDEffectCreateframesInput | undefined;
}
